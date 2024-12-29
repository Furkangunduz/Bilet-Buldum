import { Navbar, Button, Tooltip } from "flowbite-react";

function Nav({ setShowModal }) {
  return (
    <Navbar className='max-w-[42rem] mx-auto mb-5 px-6 py-5 rounded'>
      <Navbar.Brand>
        <span className='self-center whitespace-nowrap text-xl font-semibold dark:text-white'>Bilet Buldum</span>
      </Navbar.Brand>
      <div className='flex gap-4'>
        <Tooltip content='Geçmiş aramalarım'>
          <Button size={"xs"} color={"purple"} onClick={() => setShowModal(true)}>
            Aramalarım
          </Button>
        </Tooltip>
      </div>
    </Navbar>
  );
}

export default Nav;
