if (!fs.existsSync(path.join(cwd, 'package.json'))) {
    await fs.writeJson(path.join(cwd, 'package.json'), {
        name: versionId,
        version: '1.0.0',
        dependencies: {}
    });
}
