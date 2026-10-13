(function () {
  function csrfToken() {
    var input = document.querySelector('input[name="csrfmiddlewaretoken"]');
    return input ? input.value : '';
  }

  function applyState(card, toggle, completed) {
    if (card) {
      card.classList.toggle('done', completed);
    }
    toggle.checked = completed;
  }

  document.querySelectorAll('.task-toggle').forEach(function (toggle) {
    toggle.addEventListener('change', function () {
      var card = toggle.closest('.task-card');
      var url = toggle.getAttribute('data-url');
      var previous = !toggle.checked;
      applyState(card, toggle, toggle.checked);
      fetch(url, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken(),
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
      }).then(function (response) {
        if (!response.ok) {
          throw new Error('toggle failed');
        }
        return response.json();
      }).then(function (data) {
        applyState(card, toggle, data.completed);
      }).catch(function () {
        applyState(card, toggle, previous);
      });
    });
  });
})();
