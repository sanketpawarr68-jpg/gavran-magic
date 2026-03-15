export const getVisitorId = () => {
    let visitorId = localStorage.getItem('gavran_visitor_id');
    if (!visitorId) {
        // Simple random ID generator
        visitorId = 'v-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
        localStorage.setItem('gavran_visitor_id', visitorId);
    }
    return visitorId;
};
