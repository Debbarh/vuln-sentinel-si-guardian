"""Build a self-contained, source-complete SNMP::Info worker on disposable CI only."""
from pathlib import Path
import os,sys,subprocess,json,hashlib,tarfile,shutil,urllib.request,tempfile,re,platform
if os.environ.get('GITHUB_ACTIONS')!='true':raise SystemExit('Requires a disposable GitHub runner')
root=Path.cwd();desktop=root/'tools/inventory-desktop';work=Path(tempfile.mkdtemp(prefix='cs-snmp-',dir=os.environ['RUNNER_TEMP']));out=desktop/'network-runtime';out.mkdir(parents=True,exist_ok=False)
sources=json.loads((desktop/'network/sources.json').read_text());cache=work/'downloads';cache.mkdir();(out/'sources').mkdir();jobs=str(min(4,os.cpu_count()or 2));windows=sys.platform=='win32'
def run(args,cwd=work,env=None):subprocess.run([str(a)for a in args],cwd=cwd,env=env,check=True,timeout=1200)
def sha(file,algorithm='sha256'):
 h=hashlib.new(algorithm)
 with file.open('rb')as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def download(url,file,pin,algorithm='sha256'):
 assert url.startswith('https://')
 with urllib.request.urlopen(url,timeout=120)as r,file.open('wb')as f:shutil.copyfileobj(r,f,1024*1024)
 assert sha(file,algorithm)==pin,'Upstream digest mismatch'
 return file
def extract(file,name):
 directory=work/name;directory.mkdir()
 with tarfile.open(file)as t:t.extractall(directory,filter='data')
 return next(p for p in directory.iterdir()if p.is_dir())
archives={};trees={}
for item in sources:
 file=download(item['url'],cache/(item['name']+'.tar.gz'),item['sha256']);shutil.copy2(file,out/'sources'/file.name);archives[item['name']]=file
 trees[item['name']]=extract(file,item['name'])
base_env={k:v for k,v in os.environ.items()if not k.startswith(('PERL','LD_','DYLD_'))};base_env['LANG']='C';base_env['LC_ALL']='C'
if windows:
 lock=json.loads((desktop/'network/cygwin-lock.json').read_text());recorded=set()
 for item in lock['packages']:
  file=download(lock['repository']+item['path'],cache/Path(item['path']).name,item['sha512'],'sha512')
  # Trusted pinned archives. No package installer or post-install script is executed.
  run([os.path.join(os.environ['SystemRoot'],'System32','tar.exe'),'-xf',file,'-C',out])
  source=item['source']
  if source['path']not in recorded:
   recorded.add(source['path']);download(lock['repository']+source['path'],out/'sources'/Path(source['path']).name,source['sha512'],'sha512')
 for folder in ['bin','lib']:
  src=out/'usr'/folder
  if src.exists():shutil.copytree(src,out/folder,dirs_exist_ok=True,symlinks=True);shutil.rmtree(src)
 perl=out/'bin/perl.exe';make=out/'bin/make.exe';base_env['PATH']=str(out/'bin')+os.pathsep+os.environ.get('PATH','')
 # Cygwin's root is inferred from its own DLL. Its prebuilt Perl/XS versions are locked together.
else:
 perl_source=trees['perl'];run(['sh','Configure','-des','-Dprefix='+str(out),'-Dusethreads','-Uuseshrplib','-Dman1dir=none','-Dman3dir=none'],perl_source,base_env);run(['make','-j'+jobs],perl_source,base_env);run(['make','install'],perl_source,base_env)
 perl=out/'bin/perl';make='make';base_env['PATH']=str(out/'bin')+os.pathsep+base_env.get('PATH','')
 snmp=trees['net-snmp'];openssl='/usr'
 if sys.platform=='darwin':openssl=subprocess.check_output(['brew','--prefix','openssl@3'],text=True).strip()
 run(['./configure','--prefix='+str(out),'--with-default-snmp-version=3','--with-sys-contact=','--with-sys-location=','--with-logfile=/dev/null','--with-persistent-directory='+str(work/'snmp-state'),'--disable-agent','--disable-applications','--disable-manuals','--without-rpm','--without-kmem-usage','--with-openssl='+openssl,'--with-perl-modules=INSTALL_BASE='+str(out),'--disable-embedded-perl'],snmp,base_env)
 run(['make','-j'+jobs],snmp,base_env);run(['make','install'],snmp,base_env)
 # Configure's optional XS installation is verified below; no CPAN fallback is fetched.
install_base=subprocess.check_output([str(out/'bin/cygpath.exe'),'-u',str(out)],text=True).strip()if windows else str(out)
for name in ['netaddr','regexp']:
 tree=trees[name];args=[perl,'Makefile.PL','INSTALL_BASE='+install_base]
 if name=='netaddr':args.append('-noxs')
 run(args,tree,base_env);run([make],tree,base_env);run([make,'install'],tree,base_env)
shutil.copytree(trees['snmp-info']/'lib',out/'site',dirs_exist_ok=True)
shutil.copytree(trees['mibs'],out/'mibs',dirs_exist_ok=True)
# Remove executable agent/helper programs from the distribution. Only the worker interpreter is launched.
for path in list((out/'bin').glob('snmp*')):
 if path.is_file():path.unlink()
# Explicit include paths remove reliance on the build prefix and installed CPAN configuration.
libdirs=[out/'site']
for path in out.rglob('*.pm'):
 if path.name in ['Config.pm','strict.pm','DynaLoader.pm','SNMP.pm','IP.pm','Common.pm']:
  if path.name=='IP.pm'and path.parent.name=='NetAddr':libdirs.append(path.parent.parent)
  elif path.name=='Common.pm'and path.parent.name=='Regexp':libdirs.append(path.parent.parent)
  else:libdirs.append(path.parent)
libdirs=sorted(set(libdirs));libdir=out/'lib';libdir.mkdir(exist_ok=True)
if sys.platform=='linux':
 # Keep the host glibc ABI, bundle other shared dependencies, and make all RPATHs relative.
 pending=[perl,*out.rglob('*.so'),*out.rglob('*.so.*')];seen=set()
 while pending:
  file=pending.pop()
  if not file.is_file()or file in seen:continue
  seen.add(file);result=subprocess.run(['ldd',str(file)],capture_output=True,text=True)
  for dependency in re.findall(r'=> (/[^\s]+)',result.stdout):
   dep=Path(dependency)
   if dep.name.startswith(('libc.so','libm.so','libpthread.so','libdl.so','librt.so','ld-linux')):continue
   dest=libdir/dep.name
   if not dest.exists():shutil.copy2(dep.resolve(),dest);pending.append(dest)
 for file in seen:
  if file.read_bytes()[:4]==b'\x7fELF':
   assert file.resolve().is_relative_to(out.resolve());file.chmod(file.stat().st_mode|0o200);run(['patchelf','--set-rpath','$ORIGIN/'+os.path.relpath(libdir,file.parent),file])
elif sys.platform=='darwin':
 pending=[perl,*out.rglob('*.dylib'),*out.rglob('*.bundle')];seen=set()
 while pending:
  file=pending.pop()
  if not file.is_file()or file in seen:continue
  seen.add(file);linked=subprocess.check_output(['otool','-L',str(file)],text=True)
  for dependency in re.findall(r'^\s+(/[^\n]+?) \(compatibility',linked,re.M):
   if dependency.startswith(('/usr/lib/','/System/')):continue
   dep=Path(dependency);dest=libdir/dep.name
   if not dest.exists():shutil.copy2(dep,dest);pending.append(dest)
   if dest!=file:run(['install_name_tool','-change',dependency,'@loader_path/'+os.path.relpath(dest,file.parent),file])
 for file in seen:run(['codesign','--force','--sign','-',file])
# Flatten internal symlinks to regular files; refuse external links before hashing resources.
for path in list(out.rglob('*')):
 if path.is_symlink():
  target=path.readlink()
  if windows and str(target).startswith(('/usr/bin/','/bin/')):resolved=out/'bin'/str(target).split('/')[-1]
  elif windows and str(target).startswith('/usr/lib/'):resolved=out/'lib'/str(target).removeprefix('/usr/lib/')
  else:resolved=path.resolve(strict=False)
  if windows and not resolved.exists()and Path(str(resolved)+'.exe').exists():resolved=Path(str(resolved)+'.exe')
  if not resolved.exists():
   # Unneeded packaging aliases (e.g. cross-toolchain pkg-config) are not runtime dependencies.
   path.unlink();continue
  assert resolved.resolve().is_relative_to(out.resolve()),'External link in runtime'
  if resolved.is_dir():path.unlink();shutil.copytree(resolved,path,symlinks=False)
  else:
   data=resolved.read_bytes();mode=resolved.stat().st_mode;path.unlink();path.write_bytes(data);path.chmod(mode)
includes=['-I'+p.as_posix()for p in libdirs]
verify='use SNMP;use SNMP::Info;use NetAddr::IP;use Regexp::Common;die "version" unless $SNMP::Info::VERSION eq "3.985004";print "SNMP runtime loaded\\n";'
run([perl,*includes,'-e',verify],env=base_env)
manifest={'version':1,'platform':sys.platform,'arch':platform.machine().lower(),'snmpInfo':'3.985004','netSnmp':'5.9.5.2','executable':str(perl.relative_to(out)).replace('\\','/'),'include': [str(p.relative_to(out)).replace('\\','/')for p in libdirs],'mibs':[str(p.relative_to(out)).replace('\\','/')for p in (out/'mibs').iterdir()if p.is_dir()],'sources':sources,'files':{str(p.relative_to(out)).replace('\\','/'):sha(p)for p in sorted(out.rglob('*'))if p.is_file()}}
(desktop/'network-runtime-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'runtimeBuilt':True,'platform':sys.platform,'files':len(manifest['files']),'bytes':sum(p.stat().st_size for p in out.rglob('*')if p.is_file())}),flush=True)
