import yargs from 'yargs'
import React from 'react';
import { readConfigSync, TerraformDependencyConstraint } from '../../lib/config';
import { Language, LANGUAGES } from '../../lib/get/constructs-maker';
import { Get } from './ui/get'
import { renderInk } from './render-ink'
import { displayVersionMessage } from './version-check'

const config = readConfigSync();

interface Arguments {
  output: string;
  language: Language;
  upgrade: boolean;
}

class Command implements yargs.CommandModule {
  public readonly command = 'get [OPTIONS]';
  public readonly describe = 'Generate CDK Constructs for Terraform providers and modules.';

  public readonly builder = (args: yargs.Argv) => args
    .showHelpOnFail(true)
    .option('output', { default: config.codeMakerOutput, type: 'string', desc: 'Output directory for generated Constructs', alias: 'o' })
    .option('language', { default: config.language, required: true, type: 'string', desc: 'Output programming language', alias: 'l', choices: LANGUAGES })
    .option('upgrade', { default: false, required: false, type: 'boolean', desc: 'Upgrade'});

  public async handler(argv: any) {
    await displayVersionMessage()
    const args = argv as Arguments
    const providers = config.terraformProviders ?? [];
    const modules = config.terraformModules ?? [];
    const { output, language, upgrade } = args

    const constraints: TerraformDependencyConstraint[] = [...providers, ...modules]

    if (constraints.length === 0) {
      console.error(`ERROR: Please specify providers or modules in "cdktf.json" config file`);
      process.exit(1);
    }

    await renderInk(React.createElement(Get, { codeMakerOutput: output, language: language, upgrade: upgrade, constraints }));
  }
}

module.exports = new Command();
