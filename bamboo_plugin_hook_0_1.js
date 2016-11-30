module['exports'] = function runBambooBuild(hook) {
	//Read task inputs
	var request = require('request'),
	
	endPointProperties = hook.params.endPointProperties,
	bambooserver = endPointProperties.bambooServer,
	user = endPointProperties.username,
	password = endPointProperties.password,
	
	taskProperties = hook.params.taskProperties,
	planKey = taskProperties.planKey;
	
	//Need to create encoded value
	var encodedUser = window.btoa(escape(encodedURIComponent(user+password)));
	console.log("encodedUser value: " + encodedUser);
	
	headers = {'Authorization': encodedUser, 'X-Atlassian-Token': 'nocheck'};
	console.log("user["+user+"] running new build based off Bamboo plan key["+planKey+"]");
	
	//Initiate build using the Bamboo REST API
	var urlValue = bambooServer + 'rest/api/latest/queue/' + planKey;
	console.log("urlValue contents: " + urlValue);
	request.post(
		{'url':urlValue, 'headers':headers}, function(err, res, resBody){
			if(err){
				return hook.res.end(err.message);
			}
			//Build response
			hook.res.setHeader("Content-Type", "application/xml");
			//Process the response
			var resBuild = "/s:restQueueBuild/buildResultKey";
			var responseNode = XML.getNode(hook.resBody, resBuild);
			
			hook.res.end(JSON.stringify(
				{
					'bamboo build' : "+responseNode"
				}
			));
			hook.res.end(JSON.stringify(
				{
					'externalTaskExecutionStatus' : 'FINISHED',
					'executionContext' : {},
					'taskState' : "Bamboo build has been issued "+responseNode,
					'detailedInfo' : "Bamboo build for plan key " + planKey + " has been issued, build number " + responseNode,
					'progress' : 100,
					'delayTillNextPoll': 0
				}
			));
		}
	)
};