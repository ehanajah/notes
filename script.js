const notes = [];
const RENDER_EVENT = 'render-note';
const STORAGE_KEY = 'NOTE_APPS';

function isStorageExist() {
    return typeof Storage !== 'undefined';
}

function generateId() {
    return +new Date();
}

function generateNote(id, title, content) {
    return {
        id,
        title,
        content
    };
}

function findNote(noteId) {
    for (const note of notes) {
      if (note.id === noteId) {
        return note;
      }
    }
    return null;
}

function findNoteIndex(noteId) {
    for (let index = 0; index < notes.length; index++) {
        if (notes[index].id === noteId) {
            return index;
        }
    }
    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(notes);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

function makeNoteCard(note) {
    const { id, title, content } = note;

    const noteCardHTML = `
            <div class="col col-sm-6 col-lg-4 col-xl-3">
                <div class="my-2 note-card card border-dark rounded-0">
                    <div class="card-body clickable" data-id="${id}" id="note-${id}" onclick="editNote(${id})">
                        <h5 class="card-title text-truncate" id="title-${id}">Title</h5>
                        <p class="card-text text-truncate" id="content-${id}">Content</p>
                    </div>
                    <div class="row">
                        <div class="col"></div>
                        <button class="col btn btn-outline-danger mx-4 mb-3 rounded-0 delete-button" data-id="${id}" type="button">Delete</button>
                    </div>
                </div>
            </div>
    `;
    return noteCardHTML;
}

function addNote() {
    const title = $("#note-title").val();
    const content = $("#note-content").val();

    const generatedID = generateId();
    const note = generateNote(generatedID, title, content);
    notes.push(note);
    saveData();

    $(document).trigger(RENDER_EVENT);
}

function removeNote(noteId) {
    const index = findNoteIndex(noteId);

    if (index !== -1) {
        notes.splice(index, 1);
        saveData();
        $(document).trigger(RENDER_EVENT);
    }
}

function newNote() {
    const $modal = $('#staticBackdrop');
    const $deleteButton = $('#delete-button');

    const $titleInput = $('#note-title');
    const $contentTextarea = $('#note-content');
    $titleInput.val('');
    $contentTextarea.val('');

    $deleteButton.hide();

    $('.btn-outline-success').off().click(function () {
        addNote();
        $modal.modal('hide');
        $deleteButton.show();
    });
    $('.btn-close').off().click(function () {
        $modal.modal('hide');
        $deleteButton.show();
    });

    $modal.modal('show');
}

function editNote(noteId) {
    const note = findNote(noteId);

    if (!note) {
        alert('Note not found');
        return;
    }

    const $modal = $('#staticBackdrop');
    const $titleInput = $('#note-title');
    const $contentTextarea = $('#note-content');
    const $deleteButton = $('#delete-button');

    $titleInput.val(note.title);
    $contentTextarea.val(note.content);

    $('.btn-outline-success').off().click(function () {
        const updatedTitle = $titleInput.val();
        const updatedContent = $contentTextarea.val();

        note.title = updatedTitle;
        note.content = updatedContent;

        saveData();

        $modal.modal('hide');
        $(document).trigger(RENDER_EVENT);
    });

    $deleteButton.off().click(function () {
        removeNote(noteId);
        $modal.modal('hide');
        $(document).trigger(RENDER_EVENT);
    });

    $modal.modal('show');
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        notes.length = 0;
        notes.push(...data);
    }

    $(document).trigger(RENDER_EVENT);
}

$(document).ready(function () {
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

$(document).on(RENDER_EVENT, function () {
    const $noteListContainer = $('#note-cards');
    $noteListContainer.empty();

    for (const note of notes) {
        const { id, title, content } = note;
        const $noteCard = makeNoteCard(note);
        $noteListContainer.append($noteCard);

        const $titleElement = $("#title-" + id);
        const $contentElement = $("#content-" + id);

        $titleElement.text(title);
        $contentElement.text(content);
    }

    // Adding click event for delete buttons
    $('.delete-button').off().click(function () {
        const noteId = $(this).data('id');
        removeNote(noteId);
    });
});
