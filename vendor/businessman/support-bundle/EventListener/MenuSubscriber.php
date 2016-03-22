<?php
namespace BusinessMan\Bundle\SupportBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;
use Computech\Bundle\CommonBundle\Event\BuildMenuEvent;

/**
 * MenuSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupportBundle
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
     * Add this bundle's menu items
     *
     * @param BuildMenuEvent $event
     */
    public function onBuildMainMenu(BuildMenuEvent $event)
    {
        if ($this->security->isGranted('ROLE_STAFF')) {
            $root = $event->getMenu()->addChild('Support')->setAttribute('icon', 'fa-comments');

            $root->addChild('Your tickets', array('route' => 'support_calls_list_own'));
            $root->addChild('Open tickets', array('route' => 'support_calls_list_open'));
            $root->addChild('Closed tickets', array('route' => 'support_calls_list_closed'));
        }
    }
}
