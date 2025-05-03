// // Upload form logic
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const alertNode = document.querySelector('.alert');
        if (alertNode) {
            const alert = new bootstrap.Alert(alertNode);
            alert.close();
        }
    }, 3000);
});
