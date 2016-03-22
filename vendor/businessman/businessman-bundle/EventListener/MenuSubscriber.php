<?php
namespace BusinessMan\Bundle\BusinessManBundle\EventListener;

use Computech\Bundle\CommonBundle\Event\BuildMenuEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * MenuSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/BusinessManBundle
 */
class MenuSubscriber implements EventSubscriberInterface
{
    /**
     * {@inheritDoc}
     */
    public static function getSubscribedEvents()
    {
        return array(
            'menu.build.app' => array('onBuildMainMenu', 0)
        );
    }

    /**
     * Add items to main menu
     *
     * @param BuildMenuEvent $event
     */
    public function onBuildMainMenu(BuildMenuEvent $event)
    {
        $event
            ->getMenu()
            ->addChild('Dashboard', array('route' => 'businessman_dashboard'))
            ->setAttribute('icon', 'fa-dashboard');
    }
}
