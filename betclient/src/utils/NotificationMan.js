import {Store}  from 'react-notifications-component';

function showNotification(type,title,message) {
    Store.addNotification({
        title: title,
        message: message,
        type: type,
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
            duration: 1000,
            pauseOnHover: true,
            onScreen: true
        }
    });
}

// Export the function to make it accessible from other files
export { showNotification };