
  const form = document.getElementById('conversionForm');
  const loader = document.getElementById('loader');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function () {
    loader.style.display = 'block';      // Show loader
    submitBtn.disabled = true;           // Disable button
   
  });

