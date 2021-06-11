// let joinbutton= document.getElementById('1');
// joinbutton.addEventListener('click',joinfetch);
// function joinfetch(){
//     const abort = new AbortController();





//     fetch("http://localhost:8080/instructors/InstructorCourses", {

//         signal: abort.signal,

//        method: "GET",

//         headers: {

//            "Content-Type": "application/json",

           

//       },

//       })

//         .then((res) => {

//          if (!res.ok) {

//             throw Error("404");

//           }

     

//           return res.json();

//         })

//         .then((data) => {

//           props.fetchAction("instructor list courses done", data);

//         })

//         .catch((error) => {

//           if (error.name === "AbortError") {

//             console.log("aborted");

//           } else {

//             props.fetchAction("instructor list courses error");

//           }

//         })

//      return () => abort.abort();
// }