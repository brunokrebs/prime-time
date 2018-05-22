class PrimeFinderWorker extends HTMLElement {
  constructor() {
    super();

    this.primeBox = null;
    this.primeInput = null;
    this.queryButton = null;
    this.primeResult = null;

    this.template = "/components/is-prime/is-prime.html";

    this.worker = null;
  }

  async getTemplate() {
    const res = await fetch(this.template);
    const textTemplate = await res.text();

    return new DOMParser()
      .parseFromString(textTemplate, "text/html")
      .querySelector("template");
  }

  async connectedCallback() {

    const instance = (await this.getTemplate()).content.cloneNode(true);

    this.attachShadow({ mode: "open" }).appendChild(instance);

    this.primeBox = this.shadowRoot.querySelector(".prime-box");
    this.primeInput = this.shadowRoot.querySelector(".prime-input");
    this.queryButton = this.shadowRoot.querySelector(".queryButton");
    this.primeResult = this.shadowRoot.querySelector(".prime-result");

    this.worker = this.createWorker();

    this.worker.onmessage = e => {
      this.primeResult.innerHTML = e.data ? "Yes" : "No";
      this.primeBox.style.background = "#00FF39";
      this.primeBox.style.borderColor = "#00B228";

    };

    this.queryButton.addEventListener("click", e => {
      e.preventDefault();

      if (!this.primeInput.value || /\D/.test(this.primeInput.value)) {
        this.primeResult.innerHTML = `Not a number`;
        return;
      }

      this.primeResult.innerHTML = "---";
      this.primeBox.style.background = "#FF001B";
      this.primeBox.style.borderColor = "#B20013";

      this.searchPrimeWorker(e);

    });
  }

  searchPrimeWorker(e) {
    this.worker.postMessage(this.primeInput.value);
  }

  createWorker() {

    function workerFunction() {
      const self = this;
      self.onmessage = e => {

        const num = e.data;

        function searchPrime(num) {

          if (num <= 1) {
            return false;
          } else if (num <= 3) {
            return true;
          } else if (num % 2 === 0 || num % 3 === 0) {
            return false;
          } else {
            let i = 5;

            while (i * i <= num) {
              for (let m = 0; m < 900000; m++) {}

              if (num % i === 0 || num % (i + 2) === 0) {
                return false;
              }

              i = i + 6;
            }

            return true;
          }
        }

        postMessage(searchPrime(num));

      };
    }

    const fn = "(" + workerFunction + ")()";
    const blob = new Blob([fn]);
    const blobURL = window.URL.createObjectURL(blob, {
      type: "application/javascript; charset=utf-8"
    });

    return new Worker(blobURL);
  }
}

customElements.define("prime-finder-worker", PrimeFinderWorker);


