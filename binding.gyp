{
  "targets": [
    {
      "target_name": "iohook-macos",
      "sources": [ "src/main.mm" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_CXX_LIBRARY": "libc++",
        "MACOSX_DEPLOYMENT_TARGET": "10.15",
        "CLANG_CXX_LANGUAGE_STANDARD": "c++14",
        "OTHER_CPLUSPLUSFLAGS": ["-ObjC++", "-std=c++14"],
        "GCC_ENABLE_OBJC_EXCEPTIONS": "YES"
      },
      "conditions": [
        ["OS=='mac'", {
          "link_settings": {
            "libraries": [
              "-framework CoreGraphics",
              "-framework ApplicationServices",
              "-framework Foundation"
            ]
          }
        }]
      ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ]
    }
  ]
}