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
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { DisposableDelegate, IDisposable } from '@lumino/disposable';
import { ChatPanel } from './chat-panel';

/**
 * A widget extension that adds a Start Agent button to the notebook toolbar.
 */
class StartButtonExtension
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
{
  createNew(
    panel: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
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
  activate: (app: JupyterFrontEnd, _tracker: INotebookTracker) => {
    console.log('JupyterLab extension eda-agent is activated!');

    // Create and add the chat panel
    const chatPanel = new ChatPanel();
    chatPanel.id = 'eda-agent-chat-panel';
    chatPanel.title.label = 'EDA Chat';
    chatPanel.title.closable = true;
    app.shell.add(chatPanel, 'right');

    // Command to toggle the chat panel visibility
    app.commands.addCommand('eda-agent:toggle-chat', {
      label: 'Toggle EDA Chat',
      execute: () => {
        if (!chatPanel.isAttached) {
          app.shell.add(chatPanel, 'right');
        } else if (chatPanel.isHidden) {
          chatPanel.show();
          app.shell.activateById(chatPanel.id);
        } else {
          chatPanel.hide();
        }
      }
    });

    // Add the notebook toolbar button
    app.docRegistry.addWidgetExtension('Notebook', new StartButtonExtension());
  }
};

export default plugin;
