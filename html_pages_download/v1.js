// const extractYouTubeId = (url: string) => {
// 		const regExp =
// 			/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
// 		const match = url.match(regExp);
// 		return match && match[2].length === 11 ? match[2] : null;
// 	};

const extractYouTubeId = (url) => {
		const regExp =
			/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	};


console.log("the youtube id is : ",extractYouTubeId("https://www.youtube.com/watch?v=17e_19if6Io"));
// 17e_19if6Io