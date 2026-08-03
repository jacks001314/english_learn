package learning

import "fmt"

func Run(root, address string) error {
	if err := openStore(root); err != nil {
		return err
	}
	defer closeStore()

	app := newApp(root)
	fmt.Printf("English Learn running at http://localhost%s\n", address)
	return app.Listen(address)
}
