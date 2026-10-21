(function () {
  // Keep API requests scoped to the task endpoints served by this application.
  var API_BASE = '/todo/api/v1/tasks/';

  var ACCESS_KEY = 'todo.access';
  var REFRESH_KEY = 'todo.refresh';

  // Refresh an expired access token once, then retry the original API call.
  async function apiFetch(url, options) {
    options = options || {};
    options.headers = Object.assign({}, options.headers || {});
    var access = sessionStorage.getItem(ACCESS_KEY);
    if (!access) {
      window.location.assign('/login/');
      throw new Error('Authentication required');
    }

    options.headers.Authorization = 'Bearer ' + access;
    var response = await fetch(url, options);
    if (response.status !== 401) return response;

    var refresh = sessionStorage.getItem(REFRESH_KEY);
    if (refresh) {
      var refreshResponse = await fetch('/todo/api/v1/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ refresh: refresh })
      });
      if (refreshResponse.ok) {
        var tokens = await refreshResponse.json();
        sessionStorage.setItem(ACCESS_KEY, tokens.access);
        if (tokens.refresh) sessionStorage.setItem(REFRESH_KEY, tokens.refresh);
        options.headers.Authorization = 'Bearer ' + tokens.access;
        return fetch(url, options);
      }
    }

    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    window.location.assign('/login/');
    return response;
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

  var logoutForm = document.querySelector('.logout-form');
  var userName = document.querySelector('.user-name');
  if (userName && sessionStorage.getItem(ACCESS_KEY)) {
    apiFetch('/todo/api/v1/me/', {
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin'
    }).then(function (response) {
      if (!response.ok) throw new Error('Could not load account information');
      return response.json();
    }).then(function (user) {
      userName.textContent = user.email;
    }).catch(function (err) {
      console.error('Could not load account information:', err);
    });
  }
  if (logoutForm) {
    logoutForm.addEventListener('submit', function () {
      sessionStorage.removeItem(ACCESS_KEY);
      sessionStorage.removeItem(REFRESH_KEY);
    });
  }

  // Toggle visibility without assuming every page contains every component.
  function hide(el) { if (el) el.classList.add('hidden'); }
  function show(el) { if (el) el.classList.remove('hidden'); }

  function setError(el, msg) {
    if (!el) return;
    if (msg) { el.textContent = msg; show(el); } else { hide(el); }
  }

  function errorMessage(error, fallback) {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    if (error.detail) return error.detail;
    if (error.title) return Array.isArray(error.title) ? error.title[0] : error.title;
    if (error.non_field_errors) return error.non_field_errors[0];
    var firstField = Object.keys(error)[0];
    if (firstField && Array.isArray(error[firstField])) return error[firstField][0];
    return fallback;
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

        apiFetch(url, {
          method: 'PATCH',
          headers: {
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
    apiFetch(API_BASE, {
      headers: {
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
    return apiFetch(API_BASE, {
      method: 'POST',
      headers: {
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
    apiFetch(API_BASE + id + '/', {
      method: 'DELETE',
      headers: {
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
        console.error('Task creation failed:', err);
        setError(els.createError, errorMessage(err, 'Failed to add task. Please sign in again and retry.'));
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
      apiFetch(API_BASE + id + '/', {
        method: 'PATCH',
        headers: {
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
        console.error('Task update failed:', err);
        setError(els.editError, errorMessage(err, 'Failed to edit task. Please try again.'));
      });
    });
  }

  if (els.editClose) els.editClose.addEventListener('click', closeEditModal);
  if (els.editCancel) els.editCancel.addEventListener('click', closeEditModal);
  if (els.editBackdrop) els.editBackdrop.addEventListener('click', closeEditModal);

  if (sessionStorage.getItem(ACCESS_KEY)) loadTasks();
  else window.location.assign('/login/');
})();
