<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use BusinessMan\Bundle\JobBundle\Form\Type\ChildJobType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Mirsa\Bundle\MirsaBundle\Entity\SalesOrder;
use Symfony\Component\HttpFoundation\Request;

/**
 * SalesOrderController
 *
 * @author cps
 * @link   
 */
class SalesOrderController extends Controller
{
    /**
     * List all salesOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction()
    {
        return $this->render('MirsaMirsaBundle:SalesOrder:list.html.twig');
    }

    /**
     * View a sales order's details
     *
     * @param SalesOrder $salesorder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(SalesOrder $salesOrder)
    {
      /*  $so = $this->getDoctrine()->getRepository('MirsaMirsaBundle:SalesOrder')
            ->createQueryBuilder('so')
            ->select('*)')
            ->andWhere('so.id = :salesorder')
            ->getQuery();*/

        return $this->render(
            'MirsaMirsaBundle:SalesOrder:view.html.twig',
            array('salesOrder' => $salesOrder)
        );
    }
}