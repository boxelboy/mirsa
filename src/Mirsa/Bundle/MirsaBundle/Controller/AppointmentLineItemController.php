<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Mirsa\Bundle\MirsaBundle\Entity\Appointment;
use Mirsa\Bundle\MirsaBundle\Entity\AppointmentLineItem;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;

/**
 * AppointmentLineItemController
 *
 * @author Dave Hatch
 * @link
 */
class AppointmentLineItemController extends Controller
{
    protected $appointment;
    /**
     * List all Appointment Line Items
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function lineItemsForAppointmentAction(Appointment $appointment)
    {
        return $this->render('MirsaMirsaBundle:AppointmentLineItem:list.html.twig', array('appointment' => $appointment));
    }
    
    /**
     * Only fetch appointment line item records associated with the selected stock record
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        $qb->andWhere($alias . '.appointment = :appointment');
        $qb->setParameter('appointment',$this->appointment->getId());
 
        return $qb;
    }        
}