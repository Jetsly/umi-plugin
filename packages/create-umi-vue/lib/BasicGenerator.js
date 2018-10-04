const Generator = require("yeoman-generator");
const { basename } = require("path");
const debug = require("debug")("create-umi");

module.exports = class BasicGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.name = basename(process.cwd());
    this.props = {};
  }

  // prompting() {
  //   const prompts = [
  //     {
  //       name: "vue",
  //       message: "What functionality do your want to enable?",
  //       type: "checkbox",
  //       choices: [ ]
  //     }
  //   ];
  //   return this.prompt(prompts).then(props => {
  //     this.props = Object.assign(this.props, props);
  //   });
  // }

  writing() {
    debug(`this.name: ${this.name}`);
    debug(`this.props: ${JSON.stringify(this.props)}`);

    const context = {
      name: this.name,
      props: this.props
    };

    this.fs.copy(
      this.templatePath("app", "mock", ".*"),
      this.destinationPath("mock")
    );
    this.fs.copy(
      this.templatePath("app", "src", "layouts"),
      this.destinationPath("src/layouts")
    );
    this.fs.copy(
      this.templatePath("app", "src", "models"),
      this.destinationPath("src/models")
    );
    this.fs.copy(
      this.templatePath("app", "src", "pages", "index"),
      this.destinationPath("src/pages/index")
    );
    this.fs.copy(
      this.templatePath("app", "src", "global.less"),
      this.destinationPath("src/global.less")
    );
    this.fs.copyTpl(
      this.templatePath("app", "tsconfig.json"),
      this.destinationPath("tsconfig.json"),
    );
    this.fs.copyTpl(
      this.templatePath("app", "package.json"),
      this.destinationPath("package.json"),
      context
    );
    this.fs.copy(
      this.templatePath("app", "_gitignore"),
      this.destinationPath(".gitignore")
    );
    this.fs.copy(
      this.templatePath("app", ".env"),
      this.destinationPath(".env")
    );
    this.fs.copyTpl(
      this.templatePath("app", ".umirc.js"),
      this.destinationPath(".umirc.js"),
      context
    );
    this.fs.copy(
      this.templatePath("app", ".eslintrc"),
      this.destinationPath(".eslintrc")
    );
    this.fs.copy(
      this.templatePath("app", ".prettierrc"),
      this.destinationPath(".prettierrc")
    );
    this.fs.copy(
      this.templatePath("app", ".prettierignore"),
      this.destinationPath(".prettierignore")
    );
  }
};
