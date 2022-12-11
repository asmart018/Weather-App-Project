const url = "https://api.openweathermap.org/data/2.5/weather";
const query = "?q=";
const apiKey = "&appid=a00db28d8e53d88347d89ca3380e675c";
const farenheit = "&units=imperial";
const celcius = "&units=metric";
const giphyURL = "https://api.giphy.com/v1/gifs/translate";
const giphyKey = "uzSAdRQ8bhTaN2osrUOtv1SEg8msOWrN";
let units = [];

let savedArr = [];
let submitBtn = document.getElementById("submitSearch");
let input = document.getElementById("form");
let inputForDegree = "";
let F = document.getElementById("F");
let C = document.getElementById("C");

//Used for disabling/enabling the save button in the main card
let i = 0;

submitBtn.addEventListener("click", (event) => {
  //reassigns default value for units each time the form is submitted.
  units = [farenheit, "F"];
  inputForDegree = input.value;
  onSubmit(input.value);
  input.value = "";
  i = 0;
  C.disabled = false;
  F.disabled = true;
});

//Changes the units to celcius and refetches and recreates all cards.
C.addEventListener("click", (event) => {
  units = [celcius, "C"];
  onSubmit(inputForDegree);
  savedArr.forEach((element) => {
    refetchSaved(element.city, units, element.id);
  });
  F.disabled = false;
  C.disabled = true;
});

//Changes the units to farenheit and refetches and recreates all cards.
F.addEventListener("click", (event) => {
  units = [farenheit, "F"];
  onSubmit(inputForDegree);
  savedArr.forEach((element) => {
    refetchSaved(element.city, units, element.id);
  });
  F.disabled = true;
  C.disabled = false;
});

function onSubmit(input) {
  let startTime = Date.now();

  fetch(`${url}${query}${input}${apiKey}${units[0]}`, { mode: "cors" })
    .then((result) => result.json())
    .then((body) => {
      weatherData(body);
      loadCalc(startTime);
    })
    .catch((err) => {
      console.error(err.message);
      window.alert("Invalid city, please try again.");
    });
}

function weatherData(body) {
  let city = body.name;
  let temp = body.main.temp.toFixed(0);
  let weatherIcon = body.weather[0].icon;
  let weatherDesc = body.weather[0].description;
  let time = new Date().toLocaleTimeString();

  let newCity = new Location(city, temp, weatherIcon, weatherDesc, time);

  newCity.creation();
}

//Class for making the main card on the page from where you can save to the saved area.
class Location {
  constructor(city, temp, weatherIcon, weatherDesc, time) {
    this.city = city;
    this.temp = temp;
    this.weatherIcon = weatherIcon;
    this.weatherDesc = weatherDesc;
    this.time = time;
  }

  //Creates the needed elements, assigns them values and appends them.
  creation() {
    let tempcolor = "";
    if (this.temp <= 32) {
      tempcolor = "border-info";
    } else if (this.temp <= 50) {
      tempcolor = "border-primary";
    } else if (this.temp <= 70) {
      tempcolor = "border-success";
    } else if (this.temp <= 80) {
      tempcolor = "border-warning";
    } else {
      tempcolor = "border-danger";
    }

    let main = document.getElementById("mainCard");
    main.innerHTML = "";
    let card = document.createElement("div");
    card.classList.add("card", tempcolor);
    let header = document.createElement("div");
    header.classList.add("card-header", tempcolor);
    let footer = document.createElement("div");
    footer.classList.add("card-footer", tempcolor);

    let h3 = document.createElement("h3");
    let h2 = document.createElement("h2");
    let h5 = document.createElement("h5");

    let tempBody = document.createElement("div");
    tempBody.classList.add("card-body");
    let weatherBody = document.createElement("div");
    weatherBody.classList.add("card-body");
    let gifBody = document.createElement("div");
    gifBody.classList.add("gif", "card-body");

    let icon = document.createElement("img");
    let gif = document.createElement("img");
    gif.setAttribute("style", "width: 100%; height: 100%");

    //Fetch the gif from Giphy
    fetch(`${giphyURL}?api_key=${giphyKey}&s=weather+${this.weatherDesc}`, {
      mode: "cors",
    })
      .then((result) => result.json())
      .then((response) => {
        gif.src = response.data.images.original.url;
      })
      .catch((err) => {
        gif.src = "#";
        console.error(err.message);
      });

    let row = document.createElement("div");
    row.classList.add("row");
    let saveCol = document.createElement("div");
    saveCol.classList.add("col", "m-auto");
    let updateCol = document.createElement("div");
    updateCol.classList.add("col", "m-auto");

    //Creates the save button that gets disabled if the location was updated vs. submitted.
    let saveBtn = document.createElement("button");
    saveBtn.classList.add("btn", "btn-outline-secondary");
    saveBtn.setAttribute("id", "saveBtn");
    saveBtn.innerHTML = "&#10084; Save";
    if (i == 1) {
      saveBtn.disabled = true;
    } else {
      saveBtn.disabled = false;
    }

    //Creates a new SavedLocation object, pushes it to the saved array and disables the button.
    saveBtn.addEventListener("click", (event) => {
      let container = document.getElementById("savedCards");
      container.innerHTML = "";
      let saved = new SavedLocation(
        savedArr.length,
        this.city,
        this.temp,
        this.weatherIcon,
        this.weatherDesc,
        gif.src,
        this.time
      );
      savedArr.push(saved);
      savedArr.forEach((element) => {
        element.savedCreation();
      });
      saveBtn.disabled = true;
      i++;
    });

    //Creates a button with an event listener that refetches all the data and recreates the main card.
    let updateBtn = document.createElement("button");
    updateBtn.classList.add("btn", "btn-outline-secondary");
    updateBtn.setAttribute("id", "updateBtn");
    updateBtn.innerHTML = "&#10227; Update";
    updateBtn.addEventListener("click", (event) => {
      onSubmit(this.city);
    });

    let label = document.createElement("label");
    label.setAttribute("for", "updateBtn");
    label.textContent = "Last Updated: " + this.time;

    //Append elements
    h3.textContent = this.city;
    header.appendChild(h3);
    h2.textContent = this.temp + "\u00B0" + units[1];
    tempBody.appendChild(h2);
    h5.textContent = this.weatherDesc;
    icon.src = `http://openweathermap.org/img/wn/${this.weatherIcon}@2x.png`;
    weatherBody.append(icon, h5);
    gifBody.appendChild(gif);
    saveCol.appendChild(saveBtn);
    updateCol.append(label, updateBtn);
    row.append(saveCol, updateCol);
    footer.appendChild(row);
    card.append(header, tempBody, weatherBody, gifBody, footer);
    main.appendChild(card);
  }
}

//Class for making the card that will go in the saved area.
class SavedLocation {
  constructor(id, city, temp, weatherIcon, weatherDesc, src, time) {
    this.id = id;
    this.city = city;
    this.temp = temp;
    this.weatherIcon = weatherIcon;
    this.weatherDesc = weatherDesc;
    this.src = src;
    this.time = time;
  }

  //Creates the needed elements, assigns them values and appends them.
  savedCreation() {
    let tempcolor = "";
    if (this.temp <= 32) {
      tempcolor = "border-info";
    } else if (this.temp <= 50) {
      tempcolor = "border-primary";
    } else if (this.temp <= 70) {
      tempcolor = "border-success";
    } else if (this.temp <= 80) {
      tempcolor = "border-warning";
    } else {
      tempcolor = "border-danger";
    }
    let container = document.getElementById("savedCards");
    let main = document.createElement("div");
    main.classList.add("col");
    main.setAttribute("id", this.id);
    let card = document.createElement("div");
    card.classList.add("card", tempcolor);
    let header = document.createElement("div");
    header.classList.add("card-header", tempcolor);
    let footer = document.createElement("div");
    footer.classList.add("card-footer", tempcolor);

    let h3 = document.createElement("h3");
    let h2 = document.createElement("h2");
    let h5 = document.createElement("h5");

    let tempBody = document.createElement("div");
    tempBody.classList.add("card-body");
    let weatherBody = document.createElement("div");
    weatherBody.classList.add("card-body");
    let gifBody = document.createElement("div");
    gifBody.classList.add("gif", "card-body");

    let icon = document.createElement("img");
    let gif = document.createElement("img");
    gif.setAttribute("style", "width: 100%; height: 100%");
    gif.src = this.src;

    let row = document.createElement("div");
    row.classList.add("row");
    let saveCol = document.createElement("div");
    saveCol.classList.add("col", "m-auto");
    let updateCol = document.createElement("div");
    updateCol.classList.add("col", "m-auto");

    let removeBtn = document.createElement("button");
    removeBtn.classList.add("btn", "btn-outline-secondary");
    removeBtn.setAttribute("id", this.id);
    removeBtn.innerHTML = "Remove";
    removeBtn.addEventListener("click", (event) => {
      this.removeCard(event);
    });

    let upBtn = document.createElement("button");
    upBtn.classList.add("btn", "btn-outline-secondary");
    upBtn.setAttribute("id", "upBtn");
    upBtn.innerHTML = "&#10227; Update";

    //Refetches the gif and weather data and reassigns them to the instance of the card and recreates the card.
    upBtn.addEventListener("click", (event) => {
      let startTime = Date.now();
      fetch(`${giphyURL}?api_key=${giphyKey}&s=weather+${this.weatherDesc}`, {
        mode: "cors",
      })
        .then((result) => result.json())
        .then((response) => {
          this.src = response.data.images.original.url;
        })
        .catch((err) => {
          this.src = "#";
          console.error(err.message);
        });
      fetch(`${url}${query}${this.city}${apiKey}${units[0]}`, { mode: "cors" })
        .then((result) => result.json())
        .then((body) => {
          this.city = body.name;
          this.temp = body.main.temp.toFixed(0);
          this.weatherIcon = body.weather[0].icon;
          this.weatherDesc = body.weather[0].description;
          this.time = new Date().toLocaleTimeString();

          let container = document.getElementById("savedCards");
          container.innerHTML = "";
          updateData();
          loadCalc(startTime);
        })
        .catch((err) => {
          console.error(err.message);
          window.alert("Invalid city, please try again.");
        });
    });

    let label = document.createElement("label");
    label.setAttribute("for", "upBtn");
    label.textContent = "Last Updated: " + this.time;

    //Append elements
    h3.textContent = this.city;
    header.appendChild(h3);
    h2.textContent = this.temp + "\u00B0" + units[1];
    tempBody.appendChild(h2);
    h5.textContent = this.weatherDesc;
    icon.src = `http://openweathermap.org/img/wn/${this.weatherIcon}@2x.png`;
    weatherBody.append(icon, h5);
    gifBody.appendChild(gif);
    saveCol.appendChild(removeBtn);
    updateCol.append(label, upBtn);
    row.append(saveCol, updateCol);
    footer.appendChild(row);
    card.append(header, tempBody, weatherBody, gifBody, footer);
    main.appendChild(card);
    container.appendChild(main);
  }

  removeCard(event) {
    let removeId = event.target.id;
    savedArr = savedArr.filter(function (ele) {
      return ele.id !== parseInt(removeId);
    });
    let container = document.getElementById("savedCards");
    container.innerHTML = "";
    updateData();
  }
}

function updateData() {
  savedArr.forEach((element) => {
    element.savedCreation();
  });
}

function loadCalc(startTime) {
  let endTime = Date.now();
  let diff = (endTime - startTime) / 1000;
  let loading = document.getElementById("loading");
  loading.textContent = "Content loaded in " + diff.toFixed(3) + " seconds.";
}

async function refetchSaved(city, units, id) {
  await fetch(`${url}${query}${city}${apiKey}${units[0]}`, {
    mode: "cors",
  })
    .then((result) => result.json())
    .then((body) => {
      let container = document.getElementById("savedCards");
      container.innerHTML = "";
      let temp = body.main.temp.toFixed(0);
      savedArr.forEach((ele) => {
        if (ele.id == id) {
          ele.temp = temp;
        }
      });
      updateData();
    })
    .catch((err) => {
      console.error(err.message);
      window.alert("Invalid city, please try again.");
    });
}
