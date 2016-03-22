<?php
namespace BusinessMan\Bundle\ProjectBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;
use Computech\Bundle\CommonBundle\Event\BuildMenuEvent;

/**
 * MenuSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ProjectBundle
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
            $event
                ->getMenu()
                ->addChild('Projects', array('route' => 'projects_list'))
                ->setAttribute('icon', 'fa-briefcase');
        }
    }
}
