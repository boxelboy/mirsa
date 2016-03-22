<?php
namespace BusinessMan\Bundle\JobBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;
use Computech\Bundle\CommonBundle\Event\BuildMenuEvent;

/**
 * MenuSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class MenuSubscriber implements EventSubscriberInterface
{
    /**
     * @var SecurityContextInterface
     */
    private $security;

    /**
     * @param SecurityContextInterface $security
     */
    public function __construct(SecurityContextInterface $security)
    {
        $this->security = $security;
    }

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
     * Add this bundle's main menu items
     *
     * @param BuildMenuEvent $event
     */
    public function onBuildMainMenu(BuildMenuEvent $event)
    {
        if ($this->security->isGranted('ROLE_STAFF')) {
            $main = $event->getMenu()->addChild('Jobs', array())->setAttribute('icon', 'fa-cogs');

            $main->addChild('All jobs', array('route' => 'jobs_list'));
            $main->addChild('Your jobs', array('route' => 'jobs_list_own'));
        }

        if ($this->security->isGranted('ROLE_STAFF_MANAGER')) {
            $main = $event->getMenu()->getChild('Management');

            if ($main) {
                $main->addChild('Timesheets', array('route' => 'jobs_management_timesheets'));
            }
        }
    }
}
