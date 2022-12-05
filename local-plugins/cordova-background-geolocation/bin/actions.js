const fs = require('fs-extra')
const path = require('path');
const rimraf = require("rimraf");
const chalk = require('chalk');

const {
  exec,
  spawn,
  CLIError
} = require('./lib');

var args = process.argv.slice(2);
const cmd = args.shift();

const PRIVATE_MODULE_NAME = "cordova-background-geolocation";
const PUBLIC_MODULE_NAME = "cordova-background-geolocation-lt";

const COMMAND_MIRROR = 'mirror';
const COMMAND_TYPEDOC = 'typedoc';
const COMMAND_CP_DECLARATIONS = "cp-declarations"
const COMMAND_PUBLISH = 'publish';
const COMMAND_BUILD = 'build';
const COMMAND_PACKAGE = 'package';

const IS_PRIVATE_REPO = process.cwd().split('/').pop() === PRIVATE_MODULE_NAME;

const MENU = {};

function registerCommand(name, description, handler) {
  MENU[name] = {
    description: description,
    handler: handler
  };
}



/// ACTION: mirror
///
if (!IS_PRIVATE_REPO) {
  registerCommand(COMMAND_MIRROR, 'Mirror private repo into the public repo', function() {
    mirror();
  });
}

/// ACTION: cp-declarations
///
registerCommand(COMMAND_CP_DECLARATIONS, 'Copy the Typescript declarations from another project', function(args) {
  if (args.length < 1) {
    throw new CLIError('A src-path argument is required, eg: cp-declarations /path/to/other');
  }
  return cpDeclarations(args);
});


/// ACTION: typedoc
///
registerCommand(COMMAND_TYPEDOC, 'Generate the typescript docs', function() {
   typedoc();
});


/// ACTION: publish
///
registerCommand(COMMAND_PUBLISH, 'Prepare repo for publishing', function() {
  publish();
});

/// ACTION: build
///
registerCommand(COMMAND_BUILD, 'Build Typescript', function() {
  build();
});

/// ACTION: package
///
registerCommand(COMMAND_PACKAGE, 'Build package for npm publish', function() {
  package();
})

/// @private mirror implementation
///
async function mirror() {
	const SRC_PATH = path.join('..', PRIVATE_MODULE_NAME);
	console.log('- Mirroring ', SRC_PATH);
	var mirroredPaths = [
		'src',
		'www'
	];

	mirroredPaths.forEach(function(dir) {
    var src = path.join(SRC_PATH, dir);
    var dest = path.join('.', dir);
    console.log('- cp -R ', src, dest);
    fs.copySync(src, dest);
	});

  try {
    await cpDeclarations([SRC_PATH]);
    await typedoc();
    await build();
  } catch (error) {
    console.error('- Error: ', error);
    return -1;
  }
}


/// Copy Typescript declarations from another project
///
function cpDeclarations(args) {
  if (args.length < 1) {
    throw new CLIError('A src-path argument is required, eg: cp-declarations /path/to/other');
  }
  const srcPath = args.shift();

  const cmd = './scripts/cp-declarations ' + srcPath;

  return spawn(cmd);
}

/// Generate Typedoc docs
///
async function typedoc() {
  const cmd = './scripts/generate-docs';
  return spawn(cmd);
}


/// Build Typescript
///
async function build() {
  const cmd = 'tsc'
  const args = ['-p', path.join('.', 'src', 'ionic')];
  return spawn(cmd, args);
}


/// Prepare the repo for publishing
///
async function publish() {
  try {
    if (!IS_PRIVATE_REPO) {
      await mirror();
    } else {
      await typedoc();
      await build();
    }
  } catch (error) {
    console.error('- Error: ', error);
    return -1;
  }
}

async function package() {
  await rimraf.sync(path.join('.', PRIVATE_MODULE_NAME));
  await fs.mkdirSync(PRIVATE_MODULE_NAME);
  var dest = path.join('.', PRIVATE_MODULE_NAME);

  const files = [
    'package.json',
    '.npmignore',
    'LICENSE.md',
    'plugin.xml'
  ];
  files.forEach(async (file) => {
    const dest = path.join('.', PRIVATE_MODULE_NAME, file);
    console.log(chalk.green('$ cp ', file, dest));
    await fs.copySync(file, dest);
  });
  let podspec = await fs.readdirSync('.').filter(el => path.extname(el) === '.podspec')[0];
  if (podspec) {
    const dest = path.join('.', PRIVATE_MODULE_NAME, podspec);
    await fs.copy(podspec, dest);
  }
  var mirroredPaths = [
    'src',
    'www'
  ];

  mirroredPaths.forEach(async (dir) => {
    const src = path.join('.', dir);
    const dest = path.join('.', PRIVATE_MODULE_NAME, dir);
    console.log(chalk.green('$ cp -R ', src, dest));
    await fs.copySync(src, dest);
  });

  const packageFilename = path.join('.', PRIVATE_MODULE_NAME, 'package.json');
  let packageJson = JSON.parse(fs.readFileSync(packageFilename));
  packageJson.name = path.join('@transistorsoft', PRIVATE_MODULE_NAME);

  console.log(packageJson.name);
  await fs.writeFileSync(packageFilename, JSON.stringify(packageJson, null, 2));

  const cmd = '../scripts/cp-declarations ../ @transistorsoft';
  process.chdir(dest);
  const pwd = process.cwd();
  await spawn(cmd);

}

module.exports = {
  actions: MENU
};


