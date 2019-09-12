import React, {Component} from 'react';
import {Route, Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import NoteListNav from '../NoteListNav/NoteListNav';
import NotePageNav from '../NotePageNav/NotePageNav';
import NoteListMain from '../NoteListMain/NoteListMain';
import NotePageMain from '../NotePageMain/NotePageMain';
import dummyStore from '../dummy-store';
import NotefulContext from '../NotefulContext/NotefulContext';
import { withRouter } from 'react-router-dom'
import {getNotesForFolder, findNote, findFolder} from '../notes-helpers';
import './App.css';

class App extends Component {
    state = {
        notes: [],
        folders: []
    };

    componentDidMount() {
        // Fetch data for Folders
          fetch('http://localhost:9090/folders', {
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(resp => resp.json())
          .then(folderData => {
            this.setState({folders: folderData})
          })
        // Fetch data for notes
        fetch('http://localhost:9090/notes', {
          headers: {
            'Content-Type': 'application/json'
          },
        })
        .then(resp => resp.json())
        .then(notesData => {
          this.setState({notes: notesData})
        })
  }

    deleteNote = (noteId) => {      
      if (this.state.notes === noteId) {
        fetch(`http://localhost:9090/notes/${noteId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then( () => {
          const newNotes = this.state.notes.filter(note => {
            return note.id !== noteId})
            this.setState({ notes: newNotes});
        }
        )
      }
    }

    renderNavRoutes() {
        const {notes, folders} = this.state;
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => (
                            <NoteListNav
                                folders={folders}
                                notes={notes}
                                {...routeProps}
                            />
                        )}
                    />
                ))}
                <Route
                    path="/note/:noteId"
                    render={routeProps => {
                        const {noteId} = routeProps.match.params;
                        const note = findNote(notes, noteId) || {};
                        const folder = findFolder(folders, note.folderId);
                        return <NotePageNav {...routeProps} folder={folder} />;
                    }}
                />
                <Route path="/add-folder" component={NotePageNav} />
                <Route path="/add-note" component={NotePageNav} />
            </>
        );
    }

    renderMainRoutes() {
        const {notes, folders} = this.state;
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => {
                            const {folderId} = routeProps.match.params;
                            const notesForFolder = getNotesForFolder(
                                notes,
                                folderId
                            );
                            return (
                                <NoteListMain
                                    {...routeProps}
                                    notes={notesForFolder}
                                />
                            );
                        }}
                    />
                ))}
                <Route
                    path="/note/:noteId"
                    render={routeProps => {
                        const {noteId} = routeProps.match.params;
                        const note = findNote(notes, noteId);
                        return <NotePageMain {...routeProps} note={note} />;
                    }}
                />
            </>
        );
    }

    render() {
        const contextValue = {
            notes: this.state.notes,
            folders: this.state.folders,
            deleteNoteHandler: this.deleteNote
        }
        return (
            <NotefulContext.Provider value={contextValue}>
            <div className="App">
                <nav className="App__nav">{this.renderNavRoutes()}</nav>
                <header className="App__header">
                    <h1>
                        <Link to="/">Noteful</Link>{' '}
                        <FontAwesomeIcon icon="check-double" />
                    </h1>
                </header>
                <main className="App__main">{this.renderMainRoutes()}</main>
            </div>
            </NotefulContext.Provider>
        );
    }
}

export default App;
