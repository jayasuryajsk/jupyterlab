import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  INotebookModel,
  INotebookTracker,
  NotebookActions,
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

interface IAgentReply {
  type: 'text' | 'code' | 'markdown';
  content: string;
}

interface IAgent {
  handlePrompt(prompt: string): Promise<IAgentReply[]>;
}

class MockAgent implements IAgent {
  async handlePrompt(prompt: string): Promise<IAgentReply[]> {
    return [{ type: 'text', content: `You said: ${prompt}` }];
  }
}

function insertCell(
  panel: NotebookPanel,
  type: 'code' | 'markdown',
  content: string,
  execute = false
): void {
  const notebook = panel.content;
  const model = notebook.model;
  if (!model) {
    return;
  }
  const index = notebook.activeCellIndex;
  model.sharedModel.insertCell(index + 1, {
    cell_type: type,
    source: content,
    metadata: type === 'code' ? { trusted: true } : {}
  });
  notebook.activeCellIndex = index + 1;
  if (type === 'code' && execute) {
    void NotebookActions.run(notebook, panel.sessionContext);
  }
}

class EDAAgentPanel extends Widget {
  constructor(agent: IAgent, tracker: INotebookTracker) {
    super();
    const history = document.createElement('div');
    history.className = 'jp-EDAAgent-history';
    const input = document.createElement('input');
    input.type = 'text';
    const send = document.createElement('button');
    send.textContent = 'Send';
    const form = document.createElement('div');
    form.appendChild(input);
    form.appendChild(send);
    this.node.appendChild(history);
    this.node.appendChild(form);

    const append = (cls: string, text: string) => {
      const msg = document.createElement('div');
      msg.className = cls;
      msg.textContent = text;
      history.appendChild(msg);
      history.scrollTop = history.scrollHeight;
    };

    const submit = async () => {
      const text = input.value.trim();
      if (!text) {
        return;
      }
      input.value = '';
      append('jp-EDAAgent-user', text);
      const replies = await agent.handlePrompt(text);
      for (const reply of replies) {
        append('jp-EDAAgent-agent', reply.content);
        const current = tracker.currentWidget;
        if (current && (reply.type === 'code' || reply.type === 'markdown')) {
          insertCell(current, reply.type, reply.content, reply.type === 'code');
        }
      }
    };

    send.onclick = () => void submit();
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        void submit();
      }
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
    const agent = new MockAgent();
    const content = new EDAAgentPanel(agent, tracker);
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
