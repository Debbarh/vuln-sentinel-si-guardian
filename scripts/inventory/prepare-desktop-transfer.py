"""Split a verified Windows delivery into bounded, digest-pinned transport parts.

Only the complete qualified installer is published to users; these parts are CI
transport artifacts. Keep the standard artifact layout for the release verifier.
"""
from pathlib import Path
import hashlib
import json
import os
import re
import zipfile

ROOT = Path(__file__).resolve().parents[2]
PREFIX = 'tools/inventory-desktop/release/'
PROOFS = '.codex/artifacts/cyber-skill/desktop-client/'


def sha(file):
    digest = hashlib.sha256()
    with file.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def prepare(root=ROOT, chunk_size=192 * 1024 * 1024, source_run=None):
    release = root / PREFIX
    qualification = json.loads((release / 'qualification.json').read_text())
    version = qualification['version']
    assert re.fullmatch(r'\d+\.\d+\.\d+', version)
    assert qualification['channel'] == 'preview'
    assert qualification['productionFusesVerified'] and qualification['qaExcluded']
    assert re.fullmatch(r'[a-f0-9]{40}', qualification['sourceCommit'])
    artifacts = qualification['artifacts']
    assert len(artifacts) == 1
    name, digest = next(iter(artifacts.items()))
    assert name == f'Cyber-Skill-Collector-{version}-win-x64.exe'
    assert re.fullmatch(r'[a-f0-9]{64}', digest) and sha(release / name) == digest
    output = release / 'transfer'
    output.mkdir()  # Refuse stale parts from a previous build.
    archive = release / 'windows-delivery.zip'
    files = [PREFIX + name, PREFIX + 'qualification.json', PREFIX + 'SHA256SUMS']
    files += [PROOFS + name for name in ('native-qa.json', 'glpi-qa.json', 'snmp-qa.json')]
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_STORED) as bundle:
        for name in files:
            file = root / name
            assert file.is_file() and not file.is_symlink()
            bundle.write(file, name)
    parts = []
    with archive.open('rb') as stream:
        for index in range(3):
            data = stream.read(chunk_size)
            if not data:
                break
            file = output / f'part-{index}.bin'
            file.write_bytes(data)
            parts.append(dict(name=file.name, size=len(data), sha256=hashlib.sha256(data).hexdigest()))
        assert not stream.read(1), 'Delivery exceeds the three-part transport budget'
    manifest = dict(version=version, sourceRun=int(source_run or os.environ['GITHUB_RUN_ID']),
                    sourceCommit=qualification['sourceCommit'], archiveSha256=sha(archive),
                    archiveSize=archive.stat().st_size, parts=parts)
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    archive.unlink()
    return manifest


if __name__ == '__main__':
    print(json.dumps(prepare()))
