"""Restore an immutable, previously qualified CI runtime; verify its archive and every file."""
from pathlib import Path
import sys,os,json,hashlib,zipfile,subprocess,shutil
if os.environ.get('GITHUB_ACTIONS')!='true':raise SystemExit('Disposable CI only')
pins={'linux':(15175154061,'24c01ae8e0e8a15272cc32c0d2eeb618fb51d9b87713ffb703a90e2406d50117'),'darwin':(15175189068,'2c4314d1bcb8057ca35ff29ddf6e0722d177fabe00552f276b7652185d52f160'),'win32':(15175705911,'ebbb125c2330ded0a899d927916115254ac692b15359c86cf6a72b58b1778c2b')}
artifact,pin=pins[sys.platform];archive=Path(os.environ['RUNNER_TEMP'])/'qualified-snmp.zip';out=Path('tools/inventory-desktop');assert not(out/'network-runtime').exists()
def sha(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
try:
 with archive.open('wb')as f:subprocess.run(['gh','api',f'repos/Debbarh/vuln-sentinel-si-guardian/actions/artifacts/{artifact}/zip'],stdout=f,check=True,timeout=600)
 assert sha(archive)==pin,'Runtime archive digest differs'
 with zipfile.ZipFile(archive)as z:
  total=0
  for entry in z.infolist():
   if entry.is_dir():continue
   name=entry.filename.removeprefix('tools/inventory-desktop/')
   assert name=='network-runtime-manifest.json'or name.startswith('network-runtime/'),name
   assert not name.startswith('/')and not any(x in ['','..','.']for x in name.split('/'))and '\\'not in name
   total+=entry.file_size;assert total<2*1024*1024*1024
   file=out/name;file.parent.mkdir(parents=True,exist_ok=True)
   with z.open(entry)as source,file.open('xb')as dest:shutil.copyfileobj(source,dest,1024*1024)
   if sys.platform!='win32':file.chmod(0o755 if name.startswith('network-runtime/bin/')or file.suffix in ['.so','.dylib','.bundle']else 0o644)
 m=json.loads((out/'network-runtime-manifest.json').read_text());assert m['platform']==sys.platform
 for name,pin in m['files'].items():assert sha(out/'network-runtime'/name)==pin,name
 print(json.dumps({'restoredQualifiedRuntime':True,'platform':sys.platform,'artifact':artifact,'files':len(m['files'])}))
finally:archive.unlink(missing_ok=True)
