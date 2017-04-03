'use strict';

module.exports = (periodic) => {
  let reactadmin = periodic.app.controller.extension.reactadmin;
  let mfaLayout = {
    "component": "Hero",
    "props": {
      "size": "isFullheight"
    },
    "children": [{
      "component": "HeroBody",
      "props": {},
      "children": [{
        "component": "Container",
        "props": {},
        "children": [{
          "component": "Columns",
          "children": [{
              "component": "Column",
              "props": {
                "size": "is3"
              }
            },
            {
              "component": "Column",
              "props": {},
              "children": [{
                  "component": "Title",
                  "props": {
                    "style": {
                      "textAlign": "center"
                    }
                  },
                  "children": "Submit MFA Code"
                },
                {
                  "component": "ResponsiveForm",
                  "props": {
                    "validations": [{
                      "name": "code",
                      "constraints": {
                        "code": {
                          "presence": {
                            "message": "is required"
                          },
                          "length": {
                            "minimum": 6,
                            "message": "must be at least 6 digits"
                          }
                        }
                      }
                    }],
                    "cardForm": true,
                    "cardFormProps": {
                      "isFullwidth": true
                    },
                    "onSubmit": "func:this.props.validateMFA",
                    "footergroups": [{
                      "gridProps": {},
                      "formElements": [{
                        "type": "submit",
                        "value": "Submit",
                        "name": "submit",
                        "passProps": {
                          "style": {
                            "color": "#1fc8db"
                          }
                        },
                        "layoutProps": {}
                      }]
                    }],
                    "formgroups": [{
                      "gridProps": {},
                      "formElements": [{
                        "type": "text",
                        "label": "Code",
                        "submitOnEnter": true,
                        "name": "code",
                        "layoutProps": {
                          "horizontalform": true
                        }
                      }]
                    }]
                  }
                }
              ]
            },
            {
              "component": "Column",
              "props": {
                "size": "is3"
              }
            }
          ]
        }]
      }]
    }]
  };
  return {
    containers: {
      [`${reactadmin.manifest_prefix}auth/login-otp`]: {
        "layout": mfaLayout,
        "resources": {
          // mfadata: '/auth/login-otp-setup-async',
        },
        "onFinish": "render",
        'pageData': {
          'title': 'Multi-Factor Authentication',
          'navLabel': 'Multi-Factor Authentication',
        },
      },
      [`${reactadmin.manifest_prefix}mfa`]: {
        "layout": mfaLayout,
        "resources": {
          // mfadata: '/auth/login-otp-setup-async',
        },
        "onFinish": "render",
        'pageData': {
          'title': 'Multi-Factor Authentication',
          'navLabel': 'Multi-Factor Authentication',
        },
      }
    }
  };
};