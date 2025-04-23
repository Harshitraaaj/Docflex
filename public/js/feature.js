document.getElementsByClassName('upload').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const fileInput = document.getElementById('document');
    formData.append('document', fileInput.files[0]);

    try {
        const response = await fetch('/wordToPdf', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            // Show the download section
            const downloadSection = document.getElementById('downloadSection');
            downloadSection.style.display = 'block';

            // Set the download link
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = result.downloadLink;
        } else {
            alert('Conversion failed: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during conversion.');
    }
});
