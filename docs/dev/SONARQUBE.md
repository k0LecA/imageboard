# SonarQube — Installation, Setup, and Project Analysis

Instructions for installing SonarQube using Docker and analyzing the `imageboard` project.

## 1. Install Docker (Arch Linux)

If Docker is not installed yet:

```bash
sudo pacman -S docker
sudo systemctl enable --now docker
```

## 2. First-Time SonarQube Setup

Run the following command in your terminal:

```bash
sudo docker run -d \
  --name sonarqube \
  -p 127.0.0.1:9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community
```

Docker will automatically download the SonarQube image and create a container.

## 3. Managing SonarQube

### Start SonarQube Again

```bash
sudo systemctl start docker
sudo docker start sonarqube
```

### Stop SonarQube

```bash
sudo docker stop sonarqube
```

### Check Container Status

```bash
sudo docker ps
```

### View Logs

```bash
sudo docker logs -f sonarqube
```

Press `Ctrl+C` to exit the log viewer. The container will continue running.

## 4. Web Interface

Open the following URL in your browser:

**http://localhost:9000**

Default login credentials:

- **Username:** `admin`
- **Password:** `admin`

You will be asked to change the password after your first login.

## 5. Create a Project in SonarQube

In the SonarQube web interface:

1. Select **Create Local Project**.
2. Enter `imageboard` in the **Display Name** field.
3. Select **Follows the instance's default**.
4. Select **Analyze Locally**.
5. Click **Generate Token** and save the generated token.
6. Choose **JS/TS & Web** as the project technology.
7. Select the npm-based scanner option.

## 6. Install SonarScanner

SonarScanner analyzes the source code and sends the results to the SonarQube server.

Choose one of the following installation methods.

### npm — Global Installation

```bash
npm install -g @sonar/scan
```

### pnpm — Global Installation

```bash
pnpm add -g @sonar/scan
```

If pnpm displays the `ERR_PNPM_GLOBAL_BIN_DIR_NOT_IN_PATH` error, add the global binary directory to your PATH.

For the fish shell:

```fish
fish_add_path ~/.local/share/pnpm/bin
```

### pnpm — Run Without Global Installation

```bash
pnpm dlx @sonar/scan
```

The `-g` flag means *global*, so the package is installed globally instead of being added to the project's dependencies.

## 7. Run the Project Analysis

Open a terminal in the root directory of the `imageboard` repository.

Run:

```bash
sonar-scanner-npm \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=YOUR_TOKEN \
  -Dsonar.projectKey=im
```

**Important:**

- Replace `YOUR_TOKEN` with the token generated in SonarQube.
- `im` is the Project Key. Replace it if you used a different key.
- Run the command from the project's root directory.
- If you're using `pnpm dlx`, replace `sonar-scanner-npm` with `pnpm dlx @sonar/scan`, keeping the same parameters.

## 8. View Analysis Results

After the scan finishes successfully:

1. Open http://localhost:9000.
2. Navigate to the `imageboard` project.
3. Review the analysis results.

For the assignment, focus on the following metrics:

| Metric | Description |
|---|---|
| Cyclomatic Complexity | Number of independent execution paths through the code |
| Cognitive Complexity | How difficult the code is for a developer to understand |
| Maintainability Rating | Assessment of how easily the code can be maintained |
| Code Smells | Potential code quality and design issues |
| Reliability / Bugs | Potential bugs and reliability issues |
| Duplications | Amount of duplicated code |

## 9. Additional Notes

- SonarQube runs in a separate Docker container.
- SonarScanner runs locally and sends analysis results to the server.
- The Docker image does not need to be downloaded again each time.
- Analysis results and application data are stored in Docker volumes.
- To analyze the project again, simply rerun SonarScanner.
- Never commit SonarQube authentication tokens to the Git repository.
- Tokens can be revoked and regenerated in SonarQube if necessary.