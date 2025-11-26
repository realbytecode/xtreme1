import Editor from '../../Editor';
import CmdBase from './CmdBase';

export default class CmdGroup extends CmdBase {
    cmds: CmdBase[] = [];
    constructor(editor: Editor) {
        super(editor, null);
    }
    redo() {
        try {
            this.cmds.forEach((e) => {
                e.redo();
            });
        } catch (error) {
            console.error(error);
        }
    }
    undo() {
        try {
            // Undo commands in REVERSE order
            // When commands are grouped (e.g., merge: [UpdateData, DeleteTrack])
            // Undo must reverse the order: DeleteTrack.undo() first, then UpdateData.undo()
            for (let i = this.cmds.length - 1; i >= 0; i--) {
                this.cmds[i].undo();
            }
        } catch (error) {
            console.error(error);
        }
    }
}
