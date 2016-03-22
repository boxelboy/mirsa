<?php
namespace BusinessMan\Bundle\ClientBundle\EventListener;

use Computech\Bundle\CommonBundle\Event\BuildMenuEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;

/**
 * MenuSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ClientBundle
 */
class MenuSubscriber implements EventSubscriberInterface
{
    /**
     * @var \Symfony\Component\Security\Core\SecurityContextInterface
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
     * Add items to main menu
     *
     * @param BuildMenuEvent $event
     */
    public function onBuildMainMenu(BuildMenuEvent $event)
    {
        $menu = $event->getMenu();

        if ($this->security->isGranted('ROLE_STAFF')) {
            $menu->addChild('Clients', array('route' => 'clients_list'))->setAttribute('icon', 'fa-group');

            if (($contacts = $menu->getChild('Contacts')) === null) {
                $contacts = $menu->addChild('Contacts')->setAttribute('icon', 'fa-book');
            }

            $contacts->addChild('Clients', array('route' => 'client_contacts_list'));
        }
    }
}
