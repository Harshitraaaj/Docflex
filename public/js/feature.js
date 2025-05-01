// // Upload form logic
document.addEventListener('DOMContentLoaded', () => {

//     const uploadForm = document.querySelector('.upload');
//     if (uploadForm) {
//         uploadForm.addEventListener('submit', async (e) => {
//             e.preventDefault();
    
//             const formData = new FormData();
//             const fileInput = document.getElementById('document');
//             formData.append('document', fileInput.files[0]);
    
//             try {
//                 const response = await fetch('/wordToPdf', {
//                     method: 'POST',
//                     body: formData,
//                 });
    
//                 const result = await response.json();
    
//                 if (result.success) {
//                     const downloadSection = document.getElementById('downloadSection');
//                     downloadSection.style.display = 'block';
//                     const downloadLink = document.getElementById('downloadLink');
//                     downloadLink.href = result.downloadLink;
//                 } else {
//                     alert('Conversion failed: ' + result.error);
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//                 alert('An error occurred during conversion.');
//             }
//         });
//     }

    // Auto-dismiss Bootstrap alerts after 5 seconds
    setTimeout(() => {
        const alertNode = document.querySelector('.alert');
        if (alertNode) {
            const alert = new bootstrap.Alert(alertNode);
            alert.close();
        }
    }, 3000);
});
