package learning

import "github.com/kataras/iris/v12"

func newApp(root string) *iris.Application {
	app := iris.New()
	controller := NewController(NewService(), root)
	RegisterRoutes(app, controller, root)
	return app
}
