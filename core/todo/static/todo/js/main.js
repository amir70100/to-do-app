(function () {
  // Keep API requests scoped to the task endpoints served by this application.
  var API_BASE = '/todo/api/v1/tasks/';

  // Read Django's CSRF cookie so state-changing requests pass middleware checks.
  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  function csrfToken() {
    return getCookie('csrftoken') || '';
  }

  var els = {
    list: document.getElementById('task-list'),
    empty: document.getElementById('empty-state'),
    createForm: document.getElementById('task-create-form'),
    createInput: document.getElementById('task-title'),
    createError: document.getElementById('create-error'),
    stats: document.getElementById('stats-badge'),
    editModal: document.getElementById('edit-modal'),
    editBackdrop: document.getElementById('modal-backdrop'),
    editClose: document.getElementById('modal-close'),
    editForm: document.getElementById('task-edit-form'),
    editId: document.getElementById('edit-task-id'),
    editTitle: document.getElementById('edit-task-title'),
    editCancel: document.getElementById('modal-cancel'),
    editError: document.getElementById('edit-error')
  };

  // Toggle visibility without assuming every page contains every component.
  function hide(el) { if (el) el.classList.add('hidden'); }
  function show(el) { if (el) el.classList.remove('hidden'); }

  function setError(el, msg) {
    if (!el) return;
    if (msg) { el.textContent = msg; show(el); } else { hide(el); }
  }

  function renderTasks(tasks) {
    // Rebuild the list from API data and provide an explicit empty state.
    els.list.innerHTML = '';
    if (!tasks || tasks.length === 0) {
      hide(els.list);
      show(els.empty);
      if (els.stats) els.stats.textContent = '0 tasks';
      return;
    }
    show(els.list);
    hide(els.empty);
    if (els.stats) els.stats.textContent = tasks.length + ' tasks';

    tasks.forEach(function (task, index) {
      var card = document.createElement('div');
      card.className = 'task-card' + (task.completed ? ' done' : '');
      card.style.animationDelay = (index * 0.05) + 's';

      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-toggle';
      checkbox.dataset.url = API_BASE + task.id + '/';
      checkbox.checked = task.completed;

      var checkmark = document.createElement('span');
      checkmark.className = 'checkmark';

      var label = document.createElement('label');
      label.className = 'task-check';
      label.appendChild(checkbox);
      label.appendChild(checkmark);

      var info = document.createElement('div');
      info.className = 'task-info';

      var title = document.createElement('span');
      title.className = 'task-title';
      title.textContent = task.title;

      var date = document.createElement('span');
      date.className = 'task-date';
      date.textContent = new Date(task.created_at).toLocaleString('fa-IR', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      info.appendChild(title);
      info.appendChild(date);

      var actions = document.createElement('div');
      actions.className = 'task-actions';

      var editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn-edit';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openEditModal(task.id, task.title);
      });

      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn-delete';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        deleteTask(task.id);
      });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      card.appendChild(label);
      card.appendChild(info);
      card.appendChild(actions);
      els.list.appendChild(card);
    });

    document.querySelectorAll('.task-toggle').forEach(function (toggle) {
      toggle.addEventListener('change', function () {
        var url = toggle.getAttribute('data-url');
        var previous = !toggle.checked;
        var card = toggle.closest('.task-card');
        if (card) card.classList.toggle('done', toggle.checked);

        fetch(url, {
          method: 'PATCH',
          headers: {
            'X-CSRFToken': csrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ completed: toggle.checked }),
          credentials: 'same-origin'
        }).then(function (response) {
          if (!response.ok) throw new Error('toggle failed');
          return response.json();
        }).then(function (data) {
          if (card) card.classList.toggle('done', data.completed);
          toggle.checked = data.completed;
        }).catch(function () {
          if (card) card.classList.toggle('done', previous);
          toggle.checked = previous;
        });
      });
    });
  }

  function loadTasks() {
    // Fetch the authenticated user's tasks and render either paginated or plain data.
    fetch(API_BASE, {
      headers: {
        'X-CSRFToken': csrfToken(),
        'Accept': 'application/json'
      },
      credentials: 'same-origin'
    }).then(function (response) {
      if (!response.ok) throw new Error('load failed');
      return response.json();
    }).then(function (data) {
      renderTasks(data.results || data);
    }).catch(function (err) {
      console.error(err);
      hide(els.list);
      show(els.empty);
    });
  }

  function createTask(title) {
    // Submit a new task as JSON using the current session and CSRF token.
    return fetch(API_BASE, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: title }),
      credentials: 'same-origin'
    });
  }

  function deleteTask(id) {
    // Ask before deletion, then refresh the list after a successful response.
    if (!confirm('Are you sure you want to delete this task?')) return;
    fetch(API_BASE + id + '/', {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': csrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
      },
      credentials: 'same-origin'
    }).then(function (response) {
      if (!response.ok) throw new Error('delete failed');
      loadTasks();
    }).catch(function (err) {
      console.error(err);
      alert('Failed to delete task.');
    });
  }

  function openEditModal(id, title) {
    // Populate the dialog with the selected task before showing it.
    els.editId.value = id;
    els.editTitle.value = title;
    setError(els.editError, '');
    show(els.editModal);
    show(els.editBackdrop);
    els.editTitle.focus();
  }

  function closeEditModal() {
    hide(els.editModal);
    hide(els.editBackdrop);
  }

  if (els.createForm) {
    // Prevent navigation and submit the trimmed title through the API.
    els.createForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var title = els.createInput.value.trim();
      if (!title) return;
      setError(els.createError, '');
      createTask(title).then(function (response) {
        if (!response.ok) return response.json().then(function (err) { throw err; });
        return response.json();
      }).then(function () {
        els.createInput.value = '';
        loadTasks();
      }).catch(function (err) {
        var msg = err && err.title ? Array.isArray(err.title) ? err.title[0] : err.title : 'Failed to add task.';
        setError(els.createError, msg);
      });
    });
  }

  if (els.editForm) {
    // Save only the edited title and leave server-managed task fields untouched.
    els.editForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var id = els.editId.value;
      var title = els.editTitle.value.trim();
      if (!title) return;
      setError(els.editError, '');
      fetch(API_BASE + id + '/', {
        method: 'PATCH',
        headers: {
          'X-CSRFToken': csrfToken(),
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title }),
        credentials: 'same-origin'
      }).then(function (response) {
        if (!response.ok) return response.json().then(function (err) { throw err; });
        return response.json();
      }).then(function () {
        closeEditModal();
        loadTasks();
      }).catch(function (err) {
        var msg = err && err.title ? Array.isArray(err.title) ? err.title[0] : err.title : 'Failed to edit task.';
        setError(els.editError, msg);
      });
    });
  }

  if (els.editClose) els.editClose.addEventListener('click', closeEditModal);
  if (els.editCancel) els.editCancel.addEventListener('click', closeEditModal);
  if (els.editBackdrop) els.editBackdrop.addEventListener('click', closeEditModal);

  loadTasks();
})();
