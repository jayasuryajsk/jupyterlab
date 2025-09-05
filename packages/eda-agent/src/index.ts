import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookModel, INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { ToolbarButton } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';

/**
 * A widget extension that adds a Start Agent button to the notebook toolbar.
 */
class StartButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    const button = new ToolbarButton({
      label: 'Start Agent',
      onClick: () => {
        console.log('Agent Started');
      },
      tooltip: 'Start Agent'
    });
    panel.toolbar.insertItem(0, 'startAgent', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
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

    // Add the notebook toolbar button
    app.docRegistry.addWidgetExtension('Notebook', new StartButtonExtension());
  }
};

export default plugin;
