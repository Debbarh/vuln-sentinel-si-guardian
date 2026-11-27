"""Disposable CI-only SNMPv3 authPriv agent. Fixed synthetic data, no host inventory."""
import sys,os,ipaddress,asyncio,json
if os.environ.get('GITHUB_ACTIONS')!='true':raise SystemExit('Disposable CI only')
sys.path.insert(0,sys.argv[2])
from pysnmp.entity import engine,config
from pysnmp.carrier.asyncio.dgram import udp
from pysnmp.entity.rfc3413 import context,cmdrsp
from pysnmp.proto import rfc1902
address=ipaddress.ip_address(sys.argv[1]);assert address.version==4 and any(address in ipaddress.ip_network(r)for r in ['10.0.0.0/8','172.16.0.0/12','192.168.0.0/16'])
async def main():
 snmp=engine.SnmpEngine(snmpEngineID=rfc1902.OctetString(hexValue='800000000102030405'))
 config.add_transport(snmp,udp.DOMAIN_NAME,udp.UdpTransport().open_server_mode((str(address),161)))
 config.add_v3_user(snmp,'cs-fixture-ro',config.USM_AUTH_HMAC192_SHA256,'fixture-auth-only',config.USM_PRIV_CFB128_AES,'fixture-priv-only')
 config.add_vacm_user(snmp,3,'cs-fixture-ro','authPriv',readSubTree=(1,3,6),writeSubTree=(),notifySubTree=())
 mib=snmp.get_mib_builder();Scalar,Instance=mib.import_symbols('SNMPv2-SMI','MibScalar','MibScalarInstance');mib.load_modules('SNMPv2-MIB')
 # Only synthetic MIB data. No modules which inspect the runner are loaded.
 defs=[('sysDescr',(1,3,6,1,2,1,1,1),rfc1902.OctetString('Cyber-Skill CI fixture')),('sysObjectID',(1,3,6,1,2,1,1,2),rfc1902.ObjectIdentifier((1,3,6,1,4,1,99999,1))),('sysUpTime',(1,3,6,1,2,1,1,3),rfc1902.TimeTicks(12345)),('sysName',(1,3,6,1,2,1,1,5),rfc1902.OctetString('cs-fixture-switch')),('sysServices',(1,3,6,1,2,1,1,7),rfc1902.Integer32(2)),('ifNumber',(1,3,6,1,2,1,2,1),rfc1902.Integer32(1))]
 parents=[];instances=[]
 for name,oid,value in defs:
  if name=='ifNumber':parent=Scalar(oid,rfc1902.Integer32()).setMaxAccess('readonly');parents.append(parent)
  else:(parent,)=mib.import_symbols('SNMPv2-MIB',name)
  instances.append(Instance(oid,(0,),parent.syntax.clone(value)))
 mib.export_symbols('CYBER-SKILL-SCALARS',*parents,*instances)
 Table,Row,Column=mib.import_symbols('SNMPv2-SMI','MibTable','MibTableRow','MibTableColumn')
 index=Column((1,3,6,1,2,1,2,2,1,1),rfc1902.Integer32()).setMaxAccess('readonly')
 if_table=Table((1,3,6,1,2,1,2,2));if_row=Row((1,3,6,1,2,1,2,2,1)).setIndexNames((0,'CYBER-SKILL-IF','ifIndex'))
 x_table=Table((1,3,6,1,2,1,31,1,1));x_row=Row((1,3,6,1,2,1,31,1,1,1)).setIndexNames((0,'CYBER-SKILL-IF','ifIndex'))
 name_col=Column((1,3,6,1,2,1,31,1,1,1,1),rfc1902.OctetString()).setMaxAccess('readonly')
 counter_col=Column((1,3,6,1,2,1,31,1,1,1,6),rfc1902.Counter64()).setMaxAccess('readonly')
 mib.export_symbols('CYBER-SKILL-IF',ifIndex=index,ifTable=if_table,ifEntry=if_row,ifXTable=x_table,ifXEntry=x_row,ifName=name_col,ifHCInOctets=counter_col)
 mib.export_symbols('CYBER-SKILL-IF-INSTANCES',Instance(index.name,(1,),rfc1902.Integer32(1)),Instance(name_col.name,(1,),rfc1902.OctetString('EthernetFixture1')),Instance(counter_col.name,(1,),rfc1902.Counter64(18446744073709551615)))

 ctx=context.SnmpContext(snmp);cmdrsp.GetCommandResponder(snmp,ctx);cmdrsp.NextCommandResponder(snmp,ctx);cmdrsp.BulkCommandResponder(snmp,ctx)
 snmp.transport_dispatcher.job_started(1)
 print('READY',flush=True)
 await asyncio.sleep(180)
 snmp.close_dispatcher()
asyncio.run(main())
