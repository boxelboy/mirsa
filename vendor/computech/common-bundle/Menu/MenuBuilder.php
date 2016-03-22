<?php
namespace Computech\Bundle\CommonBundle\Menu;

use Computech\Bundle\CommonBundle\Event\BuildMenuEvent;
use Knp\Menu\FactoryInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Event driven menu builder
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/computech/CommonBundle
 */
class MenuBuilder
{
    /**
     * @var \Knp\Menu\FactoryInterface
     */
    private $factory;

    /**
     * @param FactoryInterface $factory
     */
    public function __construct(FactoryInterface $factory)
    {
        $this->factory = $factory;
    }

    /**
     * Fire an event to allow listeners to add to the menu being built
     *
     * @param string                   $name
     * @param Request                  $request
     * @param EventDispatcherInterface $eventDispatcher
     *
     * @return \Knp\Menu\ItemInterface
     */
    public function build($name, Request $request, EventDispatcherInterface $eventDispatcher)
    {
        $menu = $this->factory->createItem($name);
        $menu->setUri($request->getRequestUri());

        $eventDispatcher->dispatch(
            'menu.build.' . $name,
            new BuildMenuEvent($this->factory, $menu)
        );

        return $menu;
    }
}
