#!/usr/bin/env perl
BEGIN {
 require Cwd;
 if($ENV{CS_SNMP_RUNTIME}){my $root=Cwd::realpath($ENV{CS_SNMP_RUNTIME});my $work=Cwd::realpath($ENV{CS_SNMP_WORK});@INC=grep{!ref($_)&&defined(Cwd::realpath($_))&&(index(Cwd::realpath($_).'/',$root.'/')==0||index(Cwd::realpath($_).'/',$work.'/')==0)}@INC;}
}
use strict;
use warnings;
use FindBin;
use lib "$FindBin::Bin";
use JSON::PP ();
use CyberSkill::SnmpInfo;
# No secrets in command line, environment, diagnostic output or temporary credentials file.
binmode STDIN;binmode STDOUT;binmode STDERR;
my $raw='';my $buffer;
while(read(STDIN,$buffer,4096)){ $raw.=$buffer;if(length($raw)>16384){print STDERR "network_invalid\n";exit 2;} }
my $ok=eval{my $request=JSON::PP->new->utf8->decode($raw);my $result=CyberSkill::SnmpInfo::collect($request);print JSON::PP->new->utf8->canonical->allow_bignum->encode($result);1;};
if(!$ok){my $code=$@=~/^(network_invalid|network_forbidden|credentials_invalid|dependency_unavailable|network_timeout)\b/?$1:'network_unavailable';print STDERR "$code\n";exit 2;}
