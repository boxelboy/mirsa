<?php
namespace BusinessMan\Bundle\SupplierBundle\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\SecurityContextInterface;
use Computech\Bundle\CommonBundle\Event\BuildMenuEvent;

/**
 * MenuSubscriber
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/SupplierBundle
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
        $menu = $event->getMenu();

        if ($this->security->isGranted('ROLE_STAFF')) {
            $menu->addChild('Suppliers', array('route' => 'suppliers_list'))->setAttribute('icon', 'fa-truck');

            if (($contacts = $menu->getChild('Contacts')) === null) {
                $contacts = $menu->addChild('Contacts')->setAttribute('icon', 'fa-book');
            }

            $contacts->addChild('Suppliers', array('route' => 'supplier_contacts_list'));
        }
    }
}
