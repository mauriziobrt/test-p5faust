# DT-2140 Sound and Interaction Lab

Try the example first to see if webaudio and motion sensors work on your phone.

[example app](https://mauriziobrt.github.io/DT2140-Sound-Interaction-Lab/)

# Lab Instructions

## Objectives / Learning Goals

By the end of this lab, you will be able to:

- Create an **interactive web application** that connects a **modality** (e.g., phone sensors such as accelerometer, gyroscope, or touch) to **sound control** using **Faust** and **WebAssembly (WASM)**.  
- Build and test a Faust DSP module running in the browser.  
- Integrate sensor data or other input modalities to control sound parameters in real time.  
- Use **Git**, **GitHub**, and **GitHub Pages** to manage and publish your own version of the project.  

---

## Setup

0. **Install [VScode](https://code.visualstudio.com/download) or use another IDE you're comfortable with (we use VSCode)**
1. **Use your KTH Git account.**  
2. **Fork this lab repository** to your own GitHub account.  
   - Do **not** push to the teacher’s repository.  
3. **Clone your forked repository** to your local computer:
   ```bash
   git clone <URL-of-your-fork>
   ```
4. **Generate the WebAssembly (WASM)** file using [Faust IDE](https://faustide.grame.fr). You can see how to do it at [this link](https://docs.google.com/presentation/d/1lj7QYG4uRv8_6EkK9RaNHyYJWr_GaDGgUtBmQcBSjCM/edit?usp=sharing)
5. **Enable GitHub Pages** on your forked repository to host your project. You can see how to do it at [this link](https://docs.google.com/presentation/d/16rdCUduoiX9MKvGQ_ZED4n1LxoCYvBTOSD802oZfJe8/edit?usp=sharing)

---

## Configuration

For each interaction:

1. Open `interaction-n.js` and locate the following:

   ```javascript
   const dspName = "tuono";
   ```
2. Replace `"tuono"` with the name of your generated WASM file (without the `.wasm` extension).
3. Locate the following string and replace tuono with the name of your WASM file:
    
    ```javascript
        tuono.createDSP(audioContext, 1024)
        .then(node => {...
    ```

---

## Running the Project

You have two options to run the project locally:

* **Option 1 (Recommended):** Use *Live Server* in VS Code.
* **Option 2:** Create a simple Python server from the terminal:

  ```bash
  python3 -m http.server
  ```

---

## Version Control Workflow

### First Time Setup

If you already forked the repo, you don’t need to clone again.
To keep your local version updated with your fork, use:

```bash
git pull
```

### GitHub Authentication

1. Go to **Settings → Developer settings → Personal access tokens → Tokens (classic)**.
2. Create a **new access token** with permissions for your repository.
3. When prompted to log in via terminal, use your **token instead of your password**.

### Committing and Pushing Changes

```bash
git add .
git commit -m "your commit message"
git push -u origin main
```

---

## Submission Instructions

* You must **fork the repository** and work on your own copy.
* **Do not push** to the teacher’s repository.
* Ensure your project is **published on GitHub Pages** from your fork.
* Submit the **link to your GitHub Pages site** and your **repository URL** as your lab submission on **Canvas**.

---