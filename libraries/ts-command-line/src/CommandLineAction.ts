// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import * as argparse from 'argparse';
import { CommandLineParameterProvider, ICommandLineParserData } from './CommandLineParameterProvider';

/**
 * Options for the CommandLineAction constructor.
 * @public
 */
export interface ICommandLineActionOptions {
  /**
   * The name of the action.  For example, if the tool is called "example",
   * then the verb "build" might be invoked as: "example build -q --some-other-option"
   */
  actionVerb: string;

  /**
   * A quick summary that is shown on the main help page, which is displayed
   * by the command "example --help"
   */
  summary: string;

  /**
   * A detailed description that is shown on the action help page, which is displayed
   * by the command "example build --help", e.g. for actionVerb="build".
   */
  documentation: string;
}

/**
 * Represents a sub-command that is part of the CommandLineParser command line.
 * Applications should create subclasses of CommandLineAction corresponding to
 * each action that they want to expose.
 *
 * @public
 */
export abstract class CommandLineAction extends CommandLineParameterProvider {
  /** {@inheritdoc ICommandLineActionOptions.actionVerb} */
  public readonly actionVerb: string;

  /** {@inheritdoc ICommandLineActionOptions.summary} */
  public readonly summary: string;

  /** {@inheritdoc ICommandLineActionOptions.documentation} */
  public readonly documentation: string;

  private _argumentParser: argparse.ArgumentParser | undefined;

  constructor(options: ICommandLineActionOptions) {
    super();

    this.actionVerb = options.actionVerb;
    this.summary = options.summary;
    this.documentation = options.documentation;

    this._argumentParser = undefined;
  }

  /**
   * This is called internally by CommandLineParser.addAction()
   * @internal
   */
  public _buildParser(actionsSubParser: argparse.SubParser): void {
    this._argumentParser = actionsSubParser.addParser(this.actionVerb, {
      help: this.summary,
      description: this.documentation
    });

    this.onDefineParameters();
  }

  /**
   * This is called internally by CommandLineParser.execute()
   * @internal
   */
  public _processParsedData(data: ICommandLineParserData): void {
    super._processParsedData(data);
  }

  /**
   * Invoked by CommandLineParser.onExecute().
   * @internal
   */
  public _execute(): Promise<void> {
    return this.onExecute();
  }

  /**
   * {@inheritdoc CommandLineParameterProvider._getArgumentParser}
   * @internal
   */
  protected _getArgumentParser(): argparse.ArgumentParser { // override
    if (!this._argumentParser) {
      // We will improve this in the future
      throw new Error('The CommandLineAction must be added to a CommandLineParser before it can be used');
    }

    return this._argumentParser;
  }

  /**
   * {@inheritdoc CommandLineParameterProvider.onDefineParameters}
   */
  protected abstract onDefineParameters(): void;

  /**
   * Your subclass should implement this hook to perform the operation.
   */
  protected abstract onExecute(): Promise<void>;
}
