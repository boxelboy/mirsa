<?php
namespace Mirsa\Bundle\MirsaBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;
use Mirsa\Bundle\MirsaBundle\Entity\SalesOrder;

/**
 * SalesOrderController
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class SalesOrderController extends AbstractRestController
{
    /**
     * {@inheritDoc}
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction(Request $request, $_format)
    {
        return parent::listAction($request, $_format);
    }

    public function viewAction(SalesOrder $salesorder)
    {
        $so = $this->getDoctrine()->getRepository('MirsaMirsaBundle:SalesOrder')
            ->createQueryBuilder('so')
            ->select('*)')
            ->Where('so.id = :salesorder')
            ->getQuery();
            var_dump($so);exit;

        return $this->render(
            'MirsaMirsaBundle:SalesOrder:view.html.twig',
            array('salesorder' => $so)
        );
    }
    
    /**
     * {@inheritDoc}
     */
    protected function getSummaryColumnNames() {
        return array('e.total');
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'MirsaMirsaBundle:SalesOrder';
    }
}
