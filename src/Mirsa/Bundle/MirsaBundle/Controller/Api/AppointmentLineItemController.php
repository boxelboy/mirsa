<?php
namespace Mirsa\Bundle\MirsaBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;
use Mirsa\Bundle\MirsaBundle\Entity\Appointment;

/**
 * Appointment Line Item Controller
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class AppointmentLineItemController extends AbstractRestController
{
    protected $appointment;
    
    /**
     * {@inheritDoc}
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function lineItemsForAppointmentAction(Appointment $appointment, Request $request, $_format)
    {
        $this->appointment = $appointment;
        return parent::listAction($request, $_format);
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'MirsaMirsaBundle:AppointmentLineItem';
    }
    
   
    /**
     * Only fetch appointment line items associated with the selected sales order
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
