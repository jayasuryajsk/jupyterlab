import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  INotebookModel,
  INotebookTracker,
  NotebookPanel
} from '@jupyterlab/notebook';
import { ToolbarButton } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';

/**
 * A widget extension that adds a Start Agent button to the notebook toolbar.
 */
class StartButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  constructor(app: JupyterFrontEnd) {
    this._app = app;
  }

  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const button = new ToolbarButton({
      label: 'Start Agent',
      onClick: () => {
        void this._app.commands.execute('eda-agent:start-interactive');
      },
      tooltip: 'Start Agent'
    });
    panel.toolbar.insertItem(0, 'startAgent', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }

  private _app: JupyterFrontEnd;
}

/**
 * Initialization data for the eda-agent extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlab/eda-agent:plugin',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, tracker: INotebookTracker) => {
    console.log('JupyterLab extension eda-agent is activated!');

    // Create and add the side panel
    const content = new Widget();
    content.id = 'eda-agent-panel';
    content.title.label = 'EDA Agent';
    content.title.closable = true;
    content.addClass('jp-EDAAgentPanel');
    app.shell.add(content, 'left', { rank: 900 });

    const queuePlanningLoop = () => {
      void Promise.resolve().then(() => {
        console.log('Planning loop queued');
      });
    };

    app.commands.addCommand('eda-agent:start-autonomous', {
      label: 'Start EDA Agent (Autonomous)',
      execute: () => {
        queuePlanningLoop();
      }
    });

    app.commands.addCommand('eda-agent:start-interactive', {
      label: 'Start EDA Agent (Interactive)',
      execute: () => {
        app.shell.activateById(content.id);
        console.log('Interactive mode ready. Awaiting user input.');
      }
    });

    // Add the notebook toolbar button
    app.docRegistry.addWidgetExtension(
      'Notebook',
      new StartButtonExtension(app)
    );
  }
};

export default plugin;
