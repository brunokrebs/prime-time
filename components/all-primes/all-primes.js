class AllPrimesFinder extends HTMLElement {
  constructor() {
    super();

    this.primeBox = null;
    this.rangeStart = null;
    this.rangeEnd = null;
    this.queryButton = null;
    this.queryResult = null;

    this.worker = null;

    this.template = "/components/all-primes/all-primes.html";

  }

  async getTemplate() {
    const res = await fetch(this.template);
    const textTemplate = await res.text();

    return new DOMParser()
      .parseFromString(textTemplate, "text/html")
      .querySelector("template");
  }

  createWorker() {

    function workerFunction() {
      const self = this;

      /*
      Sieve of Eratosthenes
      "infinite" odds-only generator using page segmentation
      source: https://rosettacode.org/wiki/Sieve_of_Eratosthenes#JavaScript
       */


      const SoEPgClass = (function () {
        function SoEPgClass() {
          this.bi = -1; // constructor resets the enumeration to start...
        }
        SoEPgClass.prototype.next = function () {
          if (this.bi < 1) {
            if (this.bi < 0) {
              this.bi++;
              this.lowi = 0; // other initialization done here...
              this.bpa = [];
              return 2;
            } else { // bi must be zero:
              let nxt = 3 + (this.lowi << 1) + 262144;
              this.buf = [];
              for (let i = 0; i < 4096; i++) // faster initialization:
                this.buf.push(0);
              if (this.lowi <= 0) { // special culling for first page as no base primes yet:
                for (let i = 0, p = 3, sqr = 9; sqr < nxt; i++, p += 2, sqr = p * p)
                  if ((this.buf[i >> 5] & (1 << (i & 31))) === 0)
                    for (let j = (sqr - 3) >> 1; j < 131072; j += p)
                      this.buf[j >> 5] |= 1 << (j & 31);
              } else { // after the first page:
                if (!this.bpa.length) { // if this is the first page after the zero one:
                  this.bps = new SoEPgClass(); // initialize separate base primes stream:
                  this.bps.next(); // advance past the only even prime of two
                  this.bpa.push(this.bps.next()); // get the next prime (3 in this case)
                }
                // get enough base primes for the page range...
                for (let p = this.bpa[this.bpa.length - 1], sqr = p * p; sqr < nxt;
                     p = this.bps.next(), this.bpa.push(p), sqr = p * p) {}
                for (let i = 0; i < this.bpa.length; i++) {
                  let p = this.bpa[i];
                  let s = (p * p - 3) >> 1;
                  if (s >= this.lowi) // adjust start index based on page lower limit...
                    s -= this.lowi;
                  else {
                    let r = (this.lowi - s) % p;
                    s = (r !== 0) ? p - r : 0;
                  }
                  for (let j = s; j < 131072; j += p)
                    this.buf[j >> 5] |= 1 << (j & 31);
                }
              }
            }
          }
          while (this.bi < 131072 && this.buf[this.bi >> 5] & (1 << (this.bi & 31)))
            this.bi++; // find next marker still with prime status
          if (this.bi < 131072) // within buffer: output computed prime
            return 3 + ((this.lowi + this.bi++) << 1);
          else { // beyond buffer range: advance buffer
            this.bi = 0;
            this.lowi += 131072;
            return this.next(); // and recursively loop
          }
        };
        return SoEPgClass;
      })();

      self.onmessage = e => {
        const rangeStart = e.data.start;
        const rangeEnd = e.data.end;

        let elapsedTime = -new Date().getTime();
        let primeCount = 0;
        let gen = new SoEPgClass();

        let num = gen.next();

        while (num <= rangeEnd) {
          if (num >= rangeStart) {
            primeCount++;
          }

          num = gen.next();
        }
        elapsedTime += (new Date()).getTime();

        console.log('Found ' + primeCount + ' primes up to ' + rangeEnd + ' in ' + elapsedTime + ' milliseconds.');


        postMessage(primeCount);
      };
    }

    const fn = "(" + workerFunction + ")()";
    const blob = new Blob([fn]);
    const blobURL = window.URL.createObjectURL(blob, {
      type: "application/javascript; charset=utf-8"
    });

    return new Worker(blobURL);
  }

  findAllPrimes() {

    const range = {
      start: parseInt(this.rangeStart.value),
      end: parseInt(this.rangeEnd.value)
    };

    this.worker.postMessage(range);
  }

  async connectedCallback() {

    const instance = (await this.getTemplate()).content.cloneNode(true);
    this.attachShadow({ mode: "open" }).appendChild(instance);

    this.primeBox = this.shadowRoot.querySelector(".prime-box");
    this.rangeStart = this.shadowRoot.querySelector(".range-start");
    this.rangeEnd = this.shadowRoot.querySelector(".range-end");
    this.queryButton = this.shadowRoot.querySelector(".queryButton");
    this.queryResult = this.shadowRoot.querySelector(".query-result");

    this.queryButton.addEventListener("click", e => {
      e.preventDefault();

      this.queryResult.innerHTML = "---";

      if (
        !this.rangeStart.value ||
        /\D/.test(this.rangeStart.value) ||
        !this.rangeEnd.value ||
        /\D/.test(this.rangeEnd.value)
      ) {
        console.log(`Not a number`);
        return;
      }

      this.findAllPrimes();
      this.primeBox.style.background = "#FF001B";
      this.primeBox.style.borderColor = "#B20013";
    });

    this.worker = this.createWorker();

    this.worker.onmessage = e => {
      this.primeBox.style.background = "#00FF39";
      this.primeBox.style.borderColor = "#00B228";
      this.queryResult.innerHTML = e.data;
    };
  }
}

customElements.define("all-primes", AllPrimesFinder);