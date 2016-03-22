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
 * @author chris saunders
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class ActivityAssemblyController extends Controller
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
        return $this->render('MirsaMirsaBundle:ActivityAssembly:list.html.twig');
    }

}