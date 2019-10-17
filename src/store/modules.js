import noteValueModule from "./note/value";
import noteRelationModule from "./note/relation";
import noteDisplayModule from "./note/display";
import savedModule from "./note/saved";
import tagModule from "./tag/tag";
import agendaModule from "./agenda/agenda";
import stateModule from "./settings/state"
import notebookModule from "./notebook/notebook"
import userModule from "./user/user";
import settingsModule from "./settings/display";

const reducer = (state) => ({
    lastChanged: state.lastChanged,
    notes: state.notes,
    saved: state.saved,
    tag: state.tag,
    agenda: state.agenda,
    settings: state.settings,
    user: state.user,
})

const modules = {
    "note-value": noteValueModule,
    "note-relation": noteRelationModule,
    "note-display": noteDisplayModule,
    saved: savedModule, // starred & saved-filters
    tag: tagModule, // notes' #tag @tag :emoji
    agenda: agendaModule, // notes' (timestamp) or <scheduled>
    state: stateModule, // note [state]
    notebook: notebookModule, // notes' organized helper
    user: userModule, // user & session
    settings: settingsModule, // app's setting
}

export { modules, reducer }