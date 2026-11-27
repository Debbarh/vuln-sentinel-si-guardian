package CyberSkill::SnmpInfo;
use strict;
use warnings;
use Socket qw(AF_INET AF_INET6 inet_pton);
use JSON::PP ();
use B ();
use Encode ();
use MIME::Base64 ();
use Scalar::Util qw(blessed);

# PostgreSQL JSONB cannot contain U+0000. Preserve binary octets explicitly,
# including invalid UTF-8, rather than dropping bytes or inventing characters.
sub _text {
 my($v)=@_;return undef if index($v,"\0")>=0;
 return $v if utf8::is_utf8($v);
 my $copy=$v;my $decoded=eval{Encode::decode('UTF-8',$copy,Encode::FB_CROAK())};
 return $@?undef:$decoded;
}
sub _normalise {
 my($v)=@_;return undef if !defined($v);
 if(ref($v)eq'ARRAY'){return [map{_normalise($_)}@$v];}
 if(ref($v)eq'HASH'){
  my @keys=keys%$v;
  if(grep{!defined(_text($_))}@keys){return{encoding=>'typed-map',entries=>[map{{key=>_normalise($_),value=>_normalise($v->{$_})}}sort @keys]};}
  return{map{_text($_)=>_normalise($v->{$_})}@keys};
 }
 return $v if JSON::PP::is_bool($v)||(blessed($v)&&$v->isa('Math::BigInt'));
 die "network_unavailable\n" if ref($v);
 my $flags=B::svref_2object(\$v)->FLAGS;
 return $v if $flags&(B::SVf_IOK()|B::SVf_NOK());
 my $text=_text($v);return $text if defined($text);
 my $bytes=utf8::is_utf8($v)?Encode::encode('UTF-8',$v):$v;
 return{encoding=>'base64',data=>MIME::Base64::encode_base64($bytes,''),original_type=>utf8::is_utf8($v)?'text_utf8':'octets'};
}

# Only fixed getter names originating in SNMP::Info's own read maps are invoked.
# Device data, policy fields and HTTP responses never select methods or executable code.
sub _address {
 my ($v)=@_;die "network_invalid\n" if !defined($v)||ref($v)||$v=~/[%\s\/]/;
 my $family=index($v,':')>=0?AF_INET6:AF_INET;
 die "network_invalid\n" if $family==AF_INET && $v!~/^(?:0|[1-9][0-9]{0,2})(?:\.(?:0|[1-9][0-9]{0,2})){3}$/;
 my $raw=inet_pton($family,$v);die "network_invalid\n" if !defined $raw;
 return unpack('B*',$raw);
}
sub _inside {
 my ($ip,$range)=@_;return 0 if !defined($range)||ref($range)||$range!~m{^([^/]+)/([0-9]{1,3})$};
 my($base,$prefix)=($1,0+$2);my $bits=_address($base);
 return length($bits)==length($ip)&&$prefix<=length($bits)&&substr($bits,0,$prefix)eq substr($ip,0,$prefix);
}
sub _allowed {
 my($host,$scope)=@_;my $ip=_address($host);
 die "network_invalid\n" if ref($scope)ne'HASH'||!JSON::PP::is_bool($scope->{enabled})||!$scope->{enabled}||ref($scope->{ranges})ne'ARRAY'||ref($scope->{exclusions})ne'ARRAY'||!@{$scope->{ranges}}||@{$scope->{ranges}}>16||@{$scope->{exclusions}}>64;
 die "network_forbidden\n" if !grep{_inside($ip,$_)}('10.0.0.0/8','172.16.0.0/12','192.168.0.0/16','fc00::/7');
 die "network_forbidden\n" if !grep{_inside($ip,$_)}@{$scope->{ranges}};
 die "network_forbidden\n" if grep{_inside($ip,$_)}@{$scope->{exclusions}};
  for my $range(@{$scope->{ranges}}){
  die "network_invalid\n" if $range!~m{^([^/]+)/([0-9]{1,3})$};my($base,$prefix)=(_address($1),0+$2);
  die "network_invalid\n" if $prefix>length($base)||length($base)-$prefix>12||substr($base,$prefix)=~/1/;
  if(length($base)==32&&$prefix<=30&&_inside($ip,$range)){
   die "network_forbidden\n" if $ip eq $base||$ip eq substr($base,0,$prefix).('1'x(32-$prefix));
  }
 }
 return 1;
}
sub collect {
 my($request,$factory)=@_;die "network_invalid\n" if ref($request)ne'HASH';
 my $host=$request->{host};_allowed($host,$request->{scope});
 my $c=$request->{credentials};die "credentials_invalid\n" if ref($c)ne'HASH'||($c->{version}//'')ne'3'||($c->{security_level}//'')ne'authPriv'
 ||($c->{auth_protocol}//'')!~/^(?:SHA256|SHA384|SHA512)$/||($c->{privacy_protocol}//'')!~/^(?:AES|AES256)$/
 ||!defined($c->{username})||ref($c->{username})||length($c->{username})<1||length($c->{username})>32||$c->{username}=~/[\x00-\x20\x7f]/;
 for my $k(qw(auth_password privacy_password)){die "credentials_invalid\n" if !defined($c->{$k})||ref($c->{$k})||length($c->{$k})<8||length($c->{$k})>255||$c->{$k}=~/[\x00\r\n]/;}
 my $info;my $native=!$factory;
 my $mibs=eval{JSON::PP->new->decode($ENV{CS_SNMP_MIBS}//'[]')};die "dependency_unavailable\n" if ref($mibs)ne'ARRAY';
 if(!$factory){eval{require SNMP::Info;1}or die "dependency_unavailable\n";$factory=sub{SNMP::Info->new($_[0])};}
 # Alarm bounds all getter walks; the supervising process also enforces time/output bounds.
 local $SIG{ALRM}=sub{die "network_timeout\n"};alarm(60);
 my($report,$failure);
 eval {
  local $SIG{__WARN__}=sub{};
  $info=$factory->({DestHost=>$host,RemotePort=>161,Version=>3,SecLevel=>'authPriv',SecName=>$c->{username},AuthProto=>({SHA256=>'SHA-256',SHA384=>'SHA-384',SHA512=>'SHA-512'}->{$c->{auth_protocol}}),AuthPass=>$c->{auth_password},PrivProto=>$c->{privacy_protocol},PrivPass=>$c->{privacy_password},AutoSpecify=>1,IgnoreNetSNMPConf=>1,MibDirs=>$mibs,Debug=>0,Timeout=>1_000_000,Retries=>0,BulkRepeaters=>5});
  die "network_unavailable\n" if !$info||$info->error();
  if($native){SNMP::loadModules('SNMP-FRAMEWORK-MIB');$info->globals()->{snmpEngineID}='snmpEngineID';}
  my(%values,%status);
  for my $map($info->globals(),$info->funcs()){
   next if ref($map)ne'HASH';
   for my $method(sort keys %$map){
    # Authentication/credential tables are intentionally not queried, not merely hidden afterwards.
    next if $method!~/^[a-zA-Z][a-zA-Z0-9_]*$/||$method=~/^(?:set_|load_|snmp_connect_ip$|update|connect|session|store|all$)/i
       ||$method=~/(?:password|passwd|secret|credential|community|communit|authkey|privkey|licensekey|licencekey)/i;
    next if exists $status{$method};
    my $v;my $ok=eval{$v=$info->$method();1};
    if(!$ok){die "network_timeout\n" if $@=~/^network_timeout/;$status{$method}='failed';next;}
    $values{$method}=$v;$status{$method}=$info->error()?(defined($v)?'partial':'failed'):(defined($v)?'observed':'unavailable');
    if($info->can('fetch_info')){my $meta=$info->fetch_info($method);$status{$method}='partial' if ref($meta)eq'HASH'&&defined($meta->{status})&&$meta->{status}ne'absent';}
   }
  }
  # No recursion/follow-up to neighbour IPs, CLI commands, hostnames or URLs in returned fields.
  $report={format=>'cyber-skill-snmp-info-1',source=>'netdisco-snmp-info',target=>$host,engine_class=>ref($info),observed_at=>time(),values=>\%values,fields=>\%status};1;
 }or $failure=$@;
 alarm(0);die($failure=~/^network_timeout/?"network_timeout\n":"network_unavailable\n")if $failure;
 return _normalise($report);
}
1;
