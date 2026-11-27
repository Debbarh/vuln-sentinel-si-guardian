"""Verify chunk reconstruction and refusal of mismatched installer bytes."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
import hashlib
import json
import io
import zipfile

spec = importlib.util.spec_from_file_location('transfer', Path(__file__).with_name('prepare-desktop-transfer.py'))
transfer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(transfer)


class TransferTests(unittest.TestCase):
    def fixture(self, root):
        release = root / transfer.PREFIX
        release.mkdir(parents=True)
        name = 'Cyber-Skill-Collector-0.4.1-win-x64.exe'
        data = b'qualified-fixture-only' * 400
        (release / name).write_bytes(data)
        q = dict(channel='preview', version='0.4.1', sourceCommit='a' * 40,
                 productionFusesVerified=True, qaExcluded=True,
                 artifacts={name: hashlib.sha256(data).hexdigest()})
        (release / 'qualification.json').write_text(json.dumps(q))
        (release / 'SHA256SUMS').write_text('fixture')
        proof = root / transfer.PROOFS
        proof.mkdir(parents=True)
        for name in ('native-qa.json', 'glpi-qa.json', 'snmp-qa.json'):
            (proof / name).write_text('{}')
        return release

    def test_exact_reconstruction_and_proof_layout(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            release = self.fixture(root)
            manifest = transfer.prepare(root, chunk_size=4500, source_run=42)
            self.assertEqual(len(manifest['parts']), 3)
            data = b''.join((release / 'transfer' / p['name']).read_bytes() for p in manifest['parts'])
            self.assertEqual(len(data), manifest['archiveSize'])
            self.assertEqual(hashlib.sha256(data).hexdigest(), manifest['archiveSha256'])
            with zipfile.ZipFile(io.BytesIO(data)) as bundle:
                self.assertEqual(len(bundle.namelist()), 6)
                self.assertIn(transfer.PREFIX + 'qualification.json', bundle.namelist())
                self.assertIn(transfer.PROOFS + 'snmp-qa.json', bundle.namelist())
            self.assertFalse((release / 'windows-delivery.zip').exists())

    def test_refuses_changed_installer(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            release = self.fixture(root)
            (release / 'Cyber-Skill-Collector-0.4.1-win-x64.exe').write_bytes(b'changed')
            with self.assertRaises(AssertionError):
                transfer.prepare(root, source_run=42)
            self.assertFalse((release / 'transfer').exists())


if __name__ == '__main__':
    unittest.main()
