$(document).ready(function () {
    function createLoadingElement() {
        $('#wrapper').prepend('<div id="loading" style="display: none;' +
            'position: absolute;' +
            'top: 10px;' +
            'right: 10px;' +
            'z-index: 9000">' +
            '<i class="fa fa-5x fa-spin fa-spinner"></i>' +
            '</div>');
    }
});