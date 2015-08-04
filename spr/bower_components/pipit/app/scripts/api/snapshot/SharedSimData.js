define([], function() {

    var SharedSimData = (function() {

        function SharedSimData() {}

        SharedSimData.prototype.setLessonId = function(lessonId) {
            SharedSimData.data.lessonId = lessonId;
        };

        SharedSimData.prototype.setQuestionId = function(questionId) {
            SharedSimData.data.questionId = questionId;
        };

        SharedSimData.prototype.setServicesBaseUrl = function(servicesBaseUrl) {
            SharedSimData.data.servicesBaseUrl = servicesBaseUrl;
        };

        SharedSimData.prototype.setLessonAttempt = function(lessonAttempt) {
            SharedSimData.data.lessonAttempt = lessonAttempt;
        };

        SharedSimData.prototype.getData = function() {
            return {
                lessonId: SharedSimData.data.lessonId,
                questionId: SharedSimData.data.questionId,
                servicesBaseUrl: SharedSimData.data.servicesBaseUrl,
                lessonAttempt: SharedSimData.data.lessonAttempt
            };
        };

        SharedSimData.getInstance = function() {
            SharedSimData._instance = SharedSimData._instance || new SharedSimData();
            return SharedSimData._instance;
        };

        return SharedSimData;

    })();

    SharedSimData._instance = null;
    SharedSimData.data = {};


    return SharedSimData;
});
